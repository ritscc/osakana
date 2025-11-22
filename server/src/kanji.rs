use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum KanjiDifficulty {
    Easy,
    Medium,
    Hard,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Kanji {
    pub unicode: u32,
    pub yomi: String,
    pub kanji: char,
    pub difficulty: KanjiDifficulty,
}

pub fn load_kanjis() -> Vec<Kanji> {
    let csv_data = include_str!("../data.csv");
    let mut kanjis = Vec::new();

    for line in csv_data.lines() {
        if line.trim().is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split(',').collect();
        if parts.len() < 5 {
            continue;
        }

        let yomi = parts[1].to_string();
        let level = parts[2];
        let unicode_str = parts[4];

        let difficulty = match level {
            "1" => KanjiDifficulty::Easy,
            "2" => KanjiDifficulty::Medium,
            "3" => KanjiDifficulty::Hard,
            _ => continue,
        };

        let unicode = if let Some(hex) = unicode_str.strip_prefix("0x") {
            u32::from_str_radix(hex, 16).unwrap_or(0)
        } else {
            0
        };

        if unicode == 0 {
            continue;
        }

        let kanji = char::from_u32(unicode).unwrap_or('?');

        kanjis.push(Kanji {
            unicode,
            yomi,
            kanji,
            difficulty,
        });
    }

    kanjis
}

#[cfg(test)]
mod test {
    use super::load_kanjis;

    #[test]
    fn load_kanjis_from_csv() {
        assert!(!load_kanjis().is_empty());
    }
}
