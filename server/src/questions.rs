use rand::seq::IndexedRandom as _;
use serde::Serialize;
use std::time::Duration;

use crate::{KANJIS, kanji::Kanji};

#[derive(Debug, Clone, Serialize)]
pub struct Question {
    index: usize,
    kanji: Kanji,
    is_solved: bool,
}

impl Question {
    fn new(index: usize, kanji: Kanji) -> Self {
        Question {
            index,
            kanji,
            is_solved: false,
        }
    }

    pub fn judge_correction(&self, kanji_unicode: &str) -> bool {
        self.kanji.unicode == kanji_unicode
    }

    pub fn solved(&mut self) {
        self.is_solved = true;
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct Questions {
    current: Vec<Question>,
    total_time: Duration,
    remaining_time: Duration,
}

impl Default for Questions {
    fn default() -> Self {
        let default_total_time = Duration::from_mins(1);

        Questions {
            current: Vec::default(),
            total_time: default_total_time,
            remaining_time: default_total_time,
        }
    }
}

impl Questions {
    pub fn get_mut(&mut self, question_id: usize) -> Option<&mut Question> {
        self.current.get_mut(question_id)
    }

    pub fn current(&self) -> &Vec<Question> {
        &self.current
    }

    pub fn reset(&mut self) {
        self.current = KANJIS
            .get()
            .unwrap()
            .choose_multiple(&mut rand::rng(), 10)
            .cloned()
            .enumerate()
            .map(|(index, kanji)| Question::new(index, kanji))
            .collect();
    }

    pub fn set_total_time(&mut self, time: Duration) {
        self.total_time = time;
    }

    pub fn decrease_remaining_time(&mut self, duration: Duration) {
        self.remaining_time = self.remaining_time.saturating_sub(duration);
    }

    pub fn remaining_time_percentage(&self) -> f64 {
        let remaining_secs = self.remaining_time.as_secs_f64();
        let total_secs = self.total_time.as_secs_f64();

        (remaining_secs / total_secs) * 100.0
    }

    pub fn reset_time(&mut self) {
        self.remaining_time = self.total_time;
    }

    pub fn is_remaining_time_zero(&self) -> bool {
        self.remaining_time <= Duration::ZERO
    }
}
