use serde::Serialize;

use crate::questions::Questions;

#[derive(Clone, Serialize)]
pub enum SseEvent {
    ReloadQuestions { questions: Questions },
    RemainingTimePercentage { percentage: f64 },
    Answer { index: usize, is_correct: bool },
}

impl SseEvent {
    pub fn to_string(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(&self)
    }
}
