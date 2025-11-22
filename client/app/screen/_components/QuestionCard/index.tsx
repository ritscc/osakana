"use client";

import { useEffect, useState } from "react";
import Kanji from "../Kanji";

import styles from "./styles.module.scss";

interface QuestionCardProps {
  unicode: number;
  yomi: string;
  kanji: string; // 表示する正解の漢字
  difficulty: number;
  animationState?: "idle" | "entering" | "exiting";
  index?: number;
}

export default function QuestionCard({
  unicode,
  yomi,
  kanji,
  difficulty,
  animationState = "idle",
  index = 0,
}: QuestionCardProps) {
  // 内部状態は一旦無視して、親からのanimationStateを優先する形にする
  // もし親から指定がなければデフォルトの挙動（今は特にないが）
  
  return (
    <div className={styles.container}>
      <Kanji
        unicode={unicode}
        kanji={kanji}
        yomi={yomi}
        difficulty={difficulty}
        animationState={animationState}
        index={index}
      />
    </div>
  );
}
