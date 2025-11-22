use axum::{
    Router,
    extract::State,
    http::{Method, header},
    response::{Sse, sse},
    routing::{get, post},
};
use futures_util::Stream;
use std::{
    convert::Infallible,
    env,
    sync::{Arc, OnceLock},
    time::Duration,
};
use tokio::{
    sync::{Mutex, broadcast},
    time::interval,
};
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt as _, util::SubscriberInitExt as _};

mod domain;
mod kanji;
mod questions;
mod sse_event;
mod user;

use crate::{
    domain::{answer::receive_answer, ranking::register_ranking, user::create_user},
    kanji::{Kanji, load_kanjis},
    questions::Questions,
    sse_event::SseEvent,
    user::{User, Users},
};

#[derive(Clone, Debug)]
pub struct GameState {
    questions: Questions,
    participants: Users,
    ranking: Vec<User>,
    tx: broadcast::Sender<SseEvent>,
}

impl GameState {
    fn new(tx: broadcast::Sender<SseEvent>) -> Self {
        GameState {
            tx,
            questions: Questions::default(),
            participants: Users::default(),
            ranking: Vec::default(),
        }
    }
}

pub type SharedGameState = Arc<Mutex<GameState>>;

static KANJIS: OnceLock<Vec<Kanji>> = OnceLock::new();

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("failed to load .env");

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "debug".into()),
        )
        .with(tracing_subscriber::fmt::layer().pretty())
        .init();

    KANJIS.get_or_init(load_kanjis);

    let (tx, _) = broadcast::channel(10);
    let game_state = GameState::new(tx);
    let game_state = Arc::new(Mutex::new(game_state));

    let game_state_cloned = Arc::clone(&game_state);
    tokio::spawn(update_question_remaining_time(game_state_cloned));

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::exact(
            env::var("FRONTEND_URL")
                .expect("FRONTEND_URL not found")
                .parse()
                .unwrap(),
        ))
        .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(vec![
            header::ACCEPT,
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
        ])
        .allow_credentials(true);

    let app = Router::new()
        .route("/ranking", post(register_ranking))
        .route("/user", post(create_user))
        .route("/answer", post(receive_answer))
        .route("/sse", get(sse_handler))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(game_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}

async fn sse_handler(
    State(game_state): State<SharedGameState>,
) -> Sse<impl Stream<Item = Result<sse::Event, Infallible>>> {
    let mut rx = { game_state.lock().await.tx.subscribe() };

    let stream = async_stream::stream! {
        while let Ok(event) = rx.recv().await {
          yield Ok(sse::Event::default().data(event.to_string().expect("Serialize Error")));
        }
    };

    Sse::new(stream).keep_alive(sse::KeepAlive::default())
}

async fn update_question_remaining_time(game_state: SharedGameState) {
    const UPDATE_INTERVAL: Duration = Duration::from_millis(500);

    let mut interval = interval(UPDATE_INTERVAL);

    loop {
        interval.tick().await;
        let mut game_state = game_state.lock().await;

        game_state
            .questions
            .decrease_remaining_time(UPDATE_INTERVAL);

        let is_remaining_time_zero = game_state.questions.is_remaining_time_zero();

        if is_remaining_time_zero {
            game_state.questions.reset();
            game_state.questions.reset_time();

            if let Err(error) = game_state.tx.send(SseEvent::ReloadQuestions {
                questions: game_state.questions.clone(),
            }) {
                tracing::error!("Failed to send SseEvent: {error}");
            }
        }

        if let Err(error) = game_state.tx.send(SseEvent::RemainingTimePercentage {
            percentage: game_state.questions.remaining_time_percentage(),
        }) {
            tracing::error!("Failed to send SseEvent: {error}");
        }
    }
}
