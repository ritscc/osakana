"use client";

import { useEffect, useState } from "react";
import Kanji from "../Kanji";

import styles from "./styles.module.scss";

interface QuestionCardProps {
  id: number;
  yomi: string;
  kanji: string; // 表示する正解の漢字
  difficulty: number;
}

export default function QuestionCard({
  id,
  yomi,
  kanji,
  difficulty,
}: QuestionCardProps) {
  const [animationState, setAnimationState] = useState<"idle" | "appearing">("appearing");

  useEffect(() => {
    // データ変更時に出現アニメーションへリセット
    setAnimationState("appearing");
  }, [yomi, kanji]);

  // アニメーション終了時の処理
  const handleAnimationEnd = () => {
    if (animationState === "appearing") {
      setAnimationState("idle");
    }
  };

  return (
    <div
      className={`${styles.container} ${
        animationState === "appearing"
          ? styles.appearing
          : ""
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      <Kanji
        id={id}
        kanji={kanji}
        yomi={yomi}
        difficulty={difficulty}
      />
    </div>
  );
}
