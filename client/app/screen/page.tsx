"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OceanBackground from "./_components/OceanBackground";
import QuestionCard from "./_components/QuestionCard";
import TimeGauge from "./_components/TimeGauge";
import AllClear from "./_components/AllClear";
import styles from "./styles/Screen.module.scss";
import type {
  KanjiDifficulty,
  GetCurrentQuestionsResponse,
  ScreenQuestion,
  ServerQuestion,
  SseEventPayload,
} from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const difficultyMap: Record<KanjiDifficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

const toScreenQuestion = (question: ServerQuestion): ScreenQuestion => {
  const unicodeNumber = Number.parseInt(question.kanji.unicode, 16);

  return {
    index: question.index,
    unicode: Number.isNaN(unicodeNumber) ? question.index : unicodeNumber,
    unicodeHex: question.kanji.unicode,
    yomi: question.kanji.yomi,
    kanji: question.kanji.kanji,
    difficulty: difficultyMap[question.kanji.difficulty] ?? 1,
  };
};

const mapServerQuestions = (items: ServerQuestion[]) => items.map(toScreenQuestion);

const parseSseEvent = (raw: string): SseEventPayload | null => {
  try {
    return JSON.parse(raw) as SseEventPayload;
  } catch (error) {
    console.error("Failed to parse SSE payload", error, raw);
    return null;
  }
};

export default function Screen() {
  const [questions, setQuestions] = useState<ScreenQuestion[]>([]);
  const [exitingQuestions, setExitingQuestions] = useState<ScreenQuestion[]>([]);
  const [exitingCorrectAnswers, setExitingCorrectAnswers] = useState<Set<number>>(
    () => new Set<number>(),
  );
  const [isEntering, setIsEntering] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(
    () => new Set<number>(),
  );
  const [timeProgress, setTimeProgress] = useState(100);
  const [showAllClear, setShowAllClear] = useState(false);
  const [isSseConnected, setIsSseConnected] = useState(true);

  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const questionsRef = useRef<ScreenQuestion[]>([]);
  const correctAnswersRef = useRef<Set<number>>(new Set<number>());

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    correctAnswersRef.current = correctAnswers;
  }, [correctAnswers]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const addCorrectAnswer = useCallback((index: number) => {
    setCorrectAnswers((prev) => {
      if (prev.has(index)) {
        return prev;
      }

      const updated = new Set(prev);
      updated.add(index);
      return updated;
    });
  }, []);

  const startQuestionTransition = useCallback((nextQuestions: ScreenQuestion[]) => {
    if (!nextQuestions.length) {
      return;
    }

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    const previousQuestions = questionsRef.current;
    const previousCorrectAnswers = correctAnswersRef.current;

    setShowAllClear(false);

    if (previousQuestions.length > 0) {
      setExitingQuestions([...previousQuestions]);
      setExitingCorrectAnswers(new Set(previousCorrectAnswers));
    } else {
      setExitingQuestions([]);
      setExitingCorrectAnswers(new Set<number>());
    }

    setQuestions(nextQuestions);
    setCorrectAnswers(new Set<number>());
    setIsEntering(true);

    transitionTimeoutRef.current = setTimeout(() => {
      setExitingQuestions([]);
      setExitingCorrectAnswers(new Set<number>());
      setIsEntering(false);
      transitionTimeoutRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialQuestions = async () => {
      if (!BACKEND_URL) {
        console.error("NEXT_PUBLIC_BACKEND_URL is not set.");
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/current_questions`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch current questions (${response.status})`);
        }

        const data: GetCurrentQuestionsResponse = await response.json();
        if (!isMounted) {
          return;
        }

        const mapped = mapServerQuestions(data.current_questions);
        if (mapped.length) {
          setQuestions(mapped);
          setCorrectAnswers(new Set<number>());
          setExitingQuestions([]);
          setExitingCorrectAnswers(new Set<number>());
          setIsEntering(false);
        }
      } catch (error) {
        console.error("Failed to load current questions", error);
      }
    };

    fetchInitialQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!BACKEND_URL) {
      console.error("NEXT_PUBLIC_BACKEND_URL is not set.");
      return;
    }

    const eventSource = new EventSource(`${BACKEND_URL}/sse`, { withCredentials: true });

    eventSource.onopen = () => {
      setIsSseConnected(true);
    };

    eventSource.onerror = (event) => {
      console.error("SSE connection error", event);
      setIsSseConnected(false);
    };

    eventSource.onmessage = (event) => {
      const payload = parseSseEvent(event.data);
      if (!payload) {
        return;
      }

      if ("RemainingTimePercentage" in payload) {
        setTimeProgress(payload.RemainingTimePercentage.percentage);
        return;
      }

      if ("ReloadQuestions" in payload) {
        const mapped = mapServerQuestions(payload.ReloadQuestions.questions.current);
        if (mapped.length) {
          startQuestionTransition(mapped);
        }
        return;
      }

      if ("Answer" in payload && payload.Answer.is_correct) {
        addCorrectAnswer(payload.Answer.index);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [addCorrectAnswer, startQuestionTransition]);

  useEffect(() => {
    if (!questions.length || showAllClear) {
      return;
    }

    const allAnswered = questions.every((question) => correctAnswers.has(question.index));
    if (!allAnswered) {
      return;
    }

    setShowAllClear(true);
    const timeout = setTimeout(() => setShowAllClear(false), 3000);
    return () => clearTimeout(timeout);
  }, [questions, correctAnswers, showAllClear]);

  return (
    <div className={styles.container}>
      <TimeGauge progress={timeProgress} />
      <OceanBackground />
      {showAllClear && <AllClear />}

      <div className={styles.content}>
        <h1 className={styles.title}>魚へん漢字クイズ</h1>

        <div className={styles.gridWrapper}>
          <div className={styles.grid}>
            {questions.map((q, i) => (
              <div key={`${q.index}-${q.unicodeHex}`} className={styles.cardWrapper}>
                <QuestionCard
                  unicode={q.unicode}
                  yomi={q.yomi}
                  kanji={q.kanji}
                  difficulty={q.difficulty}
                  animationState={isEntering ? "entering" : "idle"}
                  index={i}
                  isCorrect={correctAnswers.has(q.index)}
                />
              </div>
            ))}
          </div>

          {exitingQuestions.length > 0 && (
            <div className={`${styles.grid} ${styles.gridOverlay}`}>
              {exitingQuestions.map((q, i) => (
                <div key={`${q.index}-${q.unicodeHex}-exiting`} className={styles.cardWrapper}>
                  <QuestionCard
                    unicode={q.unicode}
                    yomi={q.yomi}
                    kanji={q.kanji}
                    difficulty={q.difficulty}
                    animationState="exiting"
                    index={i}
                    isCorrect={exitingCorrectAnswers.has(q.index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {!isSseConnected && (
          <div className={styles.connectionStatus}>リアルタイム接続を再試行しています...</div>
        )}
      </div>
    </div>
  );
}
