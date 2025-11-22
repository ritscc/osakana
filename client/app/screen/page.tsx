"use client";

import { useState, useEffect } from "react";
import OceanBackground from "./_components/OceanBackground";
import QuestionCard from "./_components/QuestionCard";
import styles from "./styles/Screen.module.scss";

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
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [exitingQuestions, setExitingQuestions] = useState<typeof INITIAL_QUESTIONS>([]);
  const [isEntering, setIsEntering] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());

  const markAsCorrect = (unicode: number) => {
    setCorrectAnswers(prev => new Set(prev).add(unicode));
  };

  const handleReload = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newQuestions = [...INITIAL_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .map((q, i) => ({
        ...q,
        unicode: Date.now() + i,
      }));
    
    setExitingQuestions([...questions]);
    setQuestions(newQuestions);
    setCorrectAnswers(new Set());
    setIsEntering(true);

    setTimeout(() => {
      setExitingQuestions([]);
      setIsEntering(false);
    }, 4000);
  };

  return (
    <div className={styles.container}>
      <OceanBackground />
      
      <div className={styles.content}>
        <h1 className={styles.title}>
          魚へん漢字クイズ
        </h1>

        <div className={styles.gridWrapper}>
          <div className={styles.grid}>
            {questions.map((q, i) => (
              <div 
                key={q.unicode} 
                className={styles.cardWrapper}
                onClick={() => markAsCorrect(q.unicode)}
                style={{ cursor: 'pointer' }}
              >
                <QuestionCard
                  unicode={q.unicode}
                  yomi={q.yomi}
                  kanji={q.kanji}
                  difficulty={q.difficulty}
                  animationState={isEntering ? "entering" : "idle"}
                  index={i}
                  isCorrect={correctAnswers.has(q.unicode)}
                />
              </div>
            ))}
          </div>

          {exitingQuestions.length > 0 && (
            <div className={`${styles.grid} ${styles.gridOverlay}`}>
              {exitingQuestions.map((q, i) => (
                <div key={q.unicode} className={styles.cardWrapper}>
                  <QuestionCard
                    unicode={q.unicode}
                    yomi={q.yomi}
                    kanji={q.kanji}
                    difficulty={q.difficulty}
                    animationState="exiting"
                    index={i}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleReload} className={styles.reloadButton}>
          問題を入れ替える
        </button>
      </div>
    </div>
  );
}
