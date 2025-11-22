use axum::extract::ws::{self, WebSocket};

use crate::{
    SharedGameState,
    error::OsakanaError::{self, SendStreamError, SerializeError},
};

pub async fn handle_screen(
    stream: &mut WebSocket,
    game_state: SharedGameState,
) -> Result<(), OsakanaError> {
    let game_state = game_state.lock().await;
    let request = serde_json::to_string(&game_state.questions.current()).map_err(SerializeError)?;

    stream
        .send(ws::Message::text(request))
        .await
        .map_err(SendStreamError)?;

    Ok(())
}
