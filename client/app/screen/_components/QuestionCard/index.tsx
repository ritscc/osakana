"use client";

import { useEffect, useState } from "react";
import Kanji from "../Kanji";

import styles from "./styles.module.scss";

interface QuestionCardProps {
  unicode: number;
  yomi: string;
  kanji: string;
  difficulty: number;
  animationState?: "idle" | "entering" | "exiting";
  index?: number;
  isCorrect?: boolean;
}

export default function QuestionCard({
  unicode,
  yomi,
  kanji,
  difficulty,
  animationState = "idle",
  index = 0,
  isCorrect = false,
}: QuestionCardProps) {
  return (
    <div className={styles.container}>
      <Kanji
        unicode={unicode}
        kanji={kanji}
        yomi={yomi}
        difficulty={difficulty}
        animationState={animationState}
        index={index}
        isCorrect={isCorrect}
      />
    </div>
  );
}
