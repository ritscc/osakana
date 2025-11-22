use std::time::Duration;

use axum::{Json, extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};

use crate::{SharedGameState, questions::Question};

#[derive(Serialize)]
pub struct GetCurrentQuestionsResponse {
    current_questions: Vec<Question>,
}

#[axum::debug_handler]
#[tracing::instrument]
pub async fn get_current_questions(
    State(game_state): State<SharedGameState>,
) -> Result<Json<GetCurrentQuestionsResponse>, StatusCode> {
    let game_state = game_state.lock().await;
    let current_questions = game_state.questions.current();

    let response = GetCurrentQuestionsResponse {
        current_questions: current_questions.clone(),
    };

    Ok(Json(response))
}

#[derive(Debug, Deserialize)]
pub struct UpdateQuestionsTotalTimeRequest {
    time: u64,
}

#[axum::debug_handler]
#[tracing::instrument]
pub async fn update_questions_total_time(
    State(game_state): State<SharedGameState>,
    Json(request): Json<UpdateQuestionsTotalTimeRequest>,
) -> StatusCode {
    let mut game_state = game_state.lock().await;

    game_state
        .questions
        .set_total_time(Duration::from_secs(request.time));

    game_state.questions.reset_time();

    StatusCode::OK
}
