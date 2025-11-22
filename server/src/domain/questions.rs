use axum::{Json, extract::State, http::StatusCode};
use serde::Serialize;

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
