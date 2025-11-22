"use client";

import { useState } from "react";
import OceanBackground from "./_components/OceanBackground";
import QuestionCard from "./_components/QuestionCard";
import styles from "./styles/Screen.module.scss";

// デモ用データ
const INITIAL_QUESTIONS = [
  { unicode: 1, yomi: "まぐろ", kanji: "鮪", difficulty: 1 },
  { unicode: 2, yomi: "いわし", kanji: "鰯", difficulty: 1 },
  { unicode: 3, yomi: "あじ", kanji: "鯵", difficulty: 1 },
  { unicode: 4, yomi: "さけ", kanji: "鮭", difficulty: 1 },
  { unicode: 5, yomi: "さば", kanji: "鯖", difficulty: 1 },
  { unicode: 6, yomi: "かつお", kanji: "鰹", difficulty: 2 },
  { unicode: 7, yomi: "たい", kanji: "鯛", difficulty: 2 },
  { unicode: 8, yomi: "たら", kanji: "鱈", difficulty: 2 },
  { unicode: 9, yomi: "ぶり", kanji: "鰤", difficulty: 2 },
  { unicode: 10, yomi: "あゆ", kanji: "鮎", difficulty: 3 },
];

export default function Screen() {
  // 各問題の正解状態を管理
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);

  return (
    <div className={styles.container}>
      <OceanBackground />
      
      <div className={styles.content}>
        <h1 className={styles.title}>
          魚へん漢字クイズ
        </h1>

        <div className={styles.grid}>
          {questions.map((q) => (
            <div key={q.unicode} className={styles.cardWrapper}>
              <QuestionCard
                unicode={q.unicode}
                yomi={q.yomi}
                kanji={q.kanji}
                difficulty={q.difficulty}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
