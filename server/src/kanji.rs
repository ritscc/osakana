use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum KanjiDifficulty {
    Easy,
    Medium,
    Hard,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Kanji {
    pub unicode: u32,
    pub yomi: String,
    pub kanji: char,
    pub difficulty: KanjiDifficulty,
}
