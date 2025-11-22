use axum::{
    Router,
    extract::{State, WebSocketUpgrade, ws::WebSocket},
    routing::{get, post},
};
use std::{sync::Arc, time::Duration};
use tokio::{sync::Mutex, time::interval};

mod domain;
mod error;
mod kanji;
mod questions;
mod user;

use crate::{
    domain::{
        mobile::receive_answer, ranking::register_ranking, screen::handle_screen, user::create_user,
    },
    questions::Questions,
    user::{User, Users},
};

#[derive(Clone, Default)]
pub struct GameState {
    questions: Questions,
    participants: Users,
    ranking: Vec<User>,
}

pub type SharedGameState = Arc<Mutex<GameState>>;

impl GameState {
    fn new() -> Self {
        GameState::default()
    }
}

#[tokio::main]
async fn main() {
    let app_state = GameState::new();
    let app_state = Arc::new(Mutex::new(app_state));

    let app_state_cloned = Arc::clone(&app_state);
    tokio::spawn(update_question_remaining_time(app_state_cloned));

    let app = Router::new()
        .route("/register_ranking", post(register_ranking))
        .route("/user", post(create_user))
        .route("/answer", post(receive_answer))
        .route("/websocket", get(websocket_handler))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

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

        let mut state = app_state.lock().await;
        let questions = &mut state.questions;

        questions.decrease_remaining_time(UPDATE_INTERVAL);

        if questions.is_remaining_time_zero() {
            questions.reset();
            questions.reset_time();
        }
    }
}
