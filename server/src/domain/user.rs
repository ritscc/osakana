use axum::{Json, extract::State};
use serde::Serialize;
use uuid::Uuid;

use crate::{SharedGameState, user::User};

#[derive(Serialize)]
pub struct CreateUserResponse {
    user_id: String,
}

#[axum::debug_handler]
#[tracing::instrument]
pub async fn create_user(State(game_state): State<SharedGameState>) -> Json<CreateUserResponse> {
    let user_id = Uuid::new_v4();
    let new_user = User::new(user_id.to_string());

    game_state.lock().await.participants.add(new_user);

    tracing::info!("User successfly created");

    Json(CreateUserResponse {
        user_id: user_id.to_string(),
    })
}
