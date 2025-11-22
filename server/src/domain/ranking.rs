use axum::{Json, extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tokio::fs;

use crate::{SharedGameState, sse_event::SseEvent, user::User};

const RANKING_FILE_PATH: &str = "ranking.json";

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

    SseEvent::UpdateRanking {
        ranking: game_state.ranking.clone(),
    }
    .send_by(&game_state.tx);

    tracing::info!("User successfly registered to rank");

    if let Err(e) = save_ranking_to_file(&game_state.ranking).await {
        tracing::error!("Failed to save ranking to file: {}", e);
    }

    Ok(StatusCode::OK)
}

#[derive(Serialize)]
pub struct GetRakingResponse {
    ranking: Vec<User>,
}

#[axum::debug_handler]
#[tracing::instrument]
pub async fn get_ranking(
    State(game_state): State<SharedGameState>,
) -> Result<Json<GetRakingResponse>, StatusCode> {
    let game_state = game_state.lock().await;

    let response = GetRakingResponse {
        ranking: game_state.ranking.clone(),
    };

    Ok(Json(response))
}

async fn save_ranking_to_file(ranking: &Vec<User>) -> Result<(), std::io::Error> {
    let json = serde_json::to_string_pretty(ranking)?;
    fs::write(RANKING_FILE_PATH, json).await?;
    tracing::info!("Ranking saved to file: {}", RANKING_FILE_PATH);
    Ok(())
}

pub async fn load_ranking_from_file() -> Vec<User> {
    if !Path::new(RANKING_FILE_PATH).exists() {
        tracing::info!("Ranking file not found. Creating empty ranking file.");
        let empty_ranking = Vec::<User>::new();
        if let Err(e) = save_ranking_to_file(&empty_ranking).await {
            tracing::error!("Failed to create ranking file: {}", e);
        }
        return empty_ranking;
    }

    match fs::read_to_string(RANKING_FILE_PATH).await {
        Ok(content) => match serde_json::from_str::<Vec<User>>(&content) {
            Ok(ranking) => {
                tracing::info!("Ranking loaded from file: {} users", ranking.len());
                ranking
            }
            Err(e) => {
                tracing::error!(
                    "Failed to parse ranking file: {}. Starting with empty ranking.",
                    e
                );
                Vec::new()
            }
        },
        Err(e) => {
            tracing::error!(
                "Failed to read ranking file: {}. Starting with empty ranking.",
                e
            );
            Vec::new()
        }
    }
}
