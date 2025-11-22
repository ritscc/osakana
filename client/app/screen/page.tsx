"use client";

import { useState, useEffect } from "react";
import OceanBackground from "./_components/OceanBackground";
import QuestionCard from "./_components/QuestionCard";
import TimeGauge from "./_components/TimeGauge";
import AllClear from "./_components/AllClear";
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
  const [exitingCorrectAnswers, setExitingCorrectAnswers] = useState<Set<number>>(new Set());
  const [isEntering, setIsEntering] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [timeProgress, setTimeProgress] = useState(100);
  const [showAllClear, setShowAllClear] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isEntering || showAllClear) return;

    const interval = setInterval(() => {
      setTimeProgress((prev) => Math.max(0, prev - 0.2));
    }, 100);
    return () => clearInterval(interval);
  }, [isEntering, showAllClear]);

  // Trigger reload when time is up
  useEffect(() => {
    if (timeProgress === 0) {
      handleReload();
    }
  }, [timeProgress]);

  const handleReload = async (immediate = false, currentCorrectAnswers?: Set<number>) => {
    if (isEntering) return;
    if (!immediate) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const newQuestions = [...INITIAL_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .map((q, i) => ({
        ...q,
        unicode: Date.now() + i,
      }));
    
    setExitingQuestions([...questions]);
    setExitingCorrectAnswers(new Set(currentCorrectAnswers || correctAnswers));
    setQuestions(newQuestions);
    setCorrectAnswers(new Set());
    setIsEntering(true);

    setTimeout(() => {
      setExitingQuestions([]);
      setExitingCorrectAnswers(new Set());
      setIsEntering(false);
      setTimeProgress(100);
    }, 4000);
  };

  const markAsCorrect = (unicode: number) => {
    if (isEntering || showAllClear) return;
    
    const newCorrectAnswers = new Set(correctAnswers);
    newCorrectAnswers.add(unicode);
    setCorrectAnswers(newCorrectAnswers);

    if (questions.length > 0 && newCorrectAnswers.size === questions.length) {
      setShowAllClear(true);
      setTimeout(() => {
        handleReload(true, newCorrectAnswers);
        setShowAllClear(false);
      }, 3000);
    }
  };

  return (
    <div className={styles.container}>
      <TimeGauge progress={timeProgress} />
      <OceanBackground />
      {showAllClear && <AllClear />}
      
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
                style={{ cursor: isEntering ? 'default' : 'pointer' }}
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
                    isCorrect={exitingCorrectAnswers.has(q.unicode)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => handleReload(false)} 
          className={styles.reloadButton}
          disabled={isEntering}
        >
          問題を入れ替える
        </button>
      </div>
    </div>
  );
}
