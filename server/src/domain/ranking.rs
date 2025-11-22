use axum::{Json, extract::State, http::StatusCode};
use serde::Deserialize;

use crate::SharedGameState;

#[derive(Clone, Deserialize)]
pub struct RegisterRankingRequest {
    user_id: String,
    username: String,
}

#[axum::debug_handler]
pub async fn register_ranking(
    State(game_state): State<SharedGameState>,
    Json(request): Json<RegisterRankingRequest>,
) -> Result<StatusCode, StatusCode> {
    let mut game_state = game_state.lock().await;

    let user_cloned = {
        let user = game_state
            .participants
            .get_mut(&request.user_id)
            .ok_or(StatusCode::NOT_FOUND)?;

        user.set_username(request.username);
        user.clone()
    };

    game_state.ranking.push(user_cloned);
    Ok(StatusCode::OK)
}
