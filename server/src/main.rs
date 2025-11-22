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
    questions: Questions,
    participants: Users,
    ranking: Vec<User>,
}

#[derive(Clone, Debug)]
pub struct GameAssets {
    kanjis: Vec<Kanji>,
}

impl GameAssets {
    fn load() -> Self {
        GameAssets {
            kanjis: load_kanjis(),
        }
    }
}

pub type SharedGameState = Arc<Mutex<GameState>>;
pub type SharedGameAssets = Arc<GameAssets>;

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

    let game_state = GameState::default();
    let game_state = Arc::new(Mutex::new(game_state));

    let game_assets = GameAssets::load();
    let game_assets = Arc::new(game_assets);

    let game_state_cloned = Arc::clone(&game_state);
    let game_assets_cloned = Arc::clone(&game_assets);
    tokio::spawn(update_question_remaining_time(
        game_state_cloned,
        game_assets_cloned,
    ));

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
        .with_state(game_state)
        .with_state(game_assets);

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

async fn update_question_remaining_time(
    game_state: SharedGameState,
    game_assets: SharedGameAssets,
) {
    const UPDATE_INTERVAL: Duration = Duration::from_millis(33);

    let mut interval = interval(UPDATE_INTERVAL);

    loop {
        interval.tick().await;
        let mut game_state = game_state.lock().await;

        game_state
            .questions
            .decrease_remaining_time(UPDATE_INTERVAL);

        let is_remaining_time_zero = game_state.questions.is_remaining_time_zero();

        if is_remaining_time_zero {
            game_state.questions.reset(&game_assets.kanjis);
            game_state.questions.reset_time();
        }
    }
}
