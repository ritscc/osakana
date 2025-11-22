use axum::{Json, extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};

use crate::{SharedGameState, sse_event::SseEvent};

#[derive(Debug, Deserialize)]
pub struct ReceiveAnswerRequest {
    pub user_id: String,
    pub question_index: usize,
    pub kanji_unicode: String,
}

#[derive(Debug, Serialize)]
pub struct Response {
    is_correct: bool,
    combo: u32,
}

#[axum::debug_handler]
#[tracing::instrument]
pub async fn receive_answer(
    State(game_state): State<SharedGameState>,
    Json(request): Json<ReceiveAnswerRequest>,
) -> Result<Json<Response>, StatusCode> {
    let mut game_state = game_state.lock().await;

    let question = game_state
        .questions
        .get_mut(request.question_index)
        .ok_or(StatusCode::NOT_FOUND)?;

    let is_correct = question.judge_correction(&request.kanji_unicode);

    if is_correct {
        question.solved();
    }

    let user = game_state
        .participants
        .get_mut(&request.user_id)
        .ok_or(StatusCode::NOT_FOUND)?;

    if is_correct {
        user.increment_combo();
    } else {
        user.reset_combo();
    }

    let response = Response {
        is_correct,
        combo: user.combo(),
    };

    SseEvent::Answer {
        index: request.question_index,
        is_correct,
    }
    .send_by(&game_state.tx);

    Ok(Json(response))
}
