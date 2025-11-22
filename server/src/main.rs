use axum::{
    Router,
    extract::{State, WebSocketUpgrade, ws::WebSocket},
    http::{Method, header},
    routing::{get, post},
};
use std::{env, sync::Arc, time::Duration};
use tokio::{sync::Mutex, time::interval};
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt as _, util::SubscriberInitExt as _};

mod domain;
mod error;
mod kanji;
mod questions;
mod user;

use crate::{
    domain::{
        mobile::receive_answer, ranking::register_ranking, screen::handle_screen, user::create_user,
    },
    kanji::{Kanji, load_kanjis},
    questions::Questions,
    user::{User, Users},
};

#[derive(Clone, Default, Debug)]
pub struct GameState {
    kanjis: Vec<Kanji>,
    questions: Questions,
    participants: Users,
    ranking: Vec<User>,
}

pub type SharedGameState = Arc<Mutex<GameState>>;

impl GameState {
    fn new() -> Self {
        GameState {
            kanjis: load_kanjis(),
            ..Default::default()
        }
    }
}

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

    let app_state = GameState::new();
    let app_state = Arc::new(Mutex::new(app_state));

    let app_state_cloned = Arc::clone(&app_state);
    tokio::spawn(update_question_remaining_time(app_state_cloned));

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
        .route("/websocket", get(websocket_handler))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}

async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(game_state): State<SharedGameState>,
) -> axum::response::Response {
    ws.on_upgrade(|stream| websocket(stream, game_state))
}

async fn websocket(mut stream: WebSocket, game_state: SharedGameState) {
    handle_screen(&mut stream, game_state).await.unwrap();
}

async fn update_question_remaining_time(app_state: SharedGameState) {
    const UPDATE_INTERVAL: Duration = Duration::from_millis(33);

    let mut interval = interval(UPDATE_INTERVAL);

    loop {
        interval.tick().await;

        let questions = &mut app_state.lock().await.questions;

        questions.decrease_remaining_time(UPDATE_INTERVAL);

        if questions.is_remaining_time_zero() {
            questions.reset(&app_state.lock().await.kanjis);
            questions.reset_time();
        }
    }
}
