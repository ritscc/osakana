use axum::{Json, extract::State, http::StatusCode};
use serde::Deserialize;

use crate::SharedGameState;

#[derive(Clone, Deserialize, Debug)]
pub struct RegisterRankingRequest {
    user_id: String,
    username: String,
}

#[axum::debug_handler]
#[tracing::instrument]
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

        tracing::info!("Username is successfly set to user: ${}", user.id());

        user.clone()
    };

    game_state.ranking.push(user_cloned);

    tracing::info!("User successfly registered to rank");

    Ok(StatusCode::OK)
}
