use serde::Serialize;
use tokio::sync::broadcast;

use crate::{questions::Questions, user::User};

#[derive(Clone, Serialize)]
pub enum SseEvent {
    ReloadQuestions { questions: Questions },
    RemainingTimePercentage { percentage: f64 },
    Answer { index: usize, is_correct: bool },
    UpdateRanking { ranking: Vec<User> },
}

impl SseEvent {
    pub fn to_string(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(&self)
    }

    pub fn send_by(self, tx: &broadcast::Sender<SseEvent>) {
        if let Err(error) = tx.send(self) {
            tracing::error!("Failed to send SseEvent: {error}");
        }
    }
}
