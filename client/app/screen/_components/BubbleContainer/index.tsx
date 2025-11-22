import React from "react";
import styles from "./styles.module.scss";

interface BubbleContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isCorrect?: boolean;
}

export default function BubbleContainer({ children, className = "", style, isCorrect = false }: BubbleContainerProps) {
  return (
    <div
      className={`${styles.container} ${className} ${isCorrect ? styles.correct : ""}`}
      style={style}
    >
      <div className={styles.highlightTop} />
      <div className={styles.highlightBottom} />
      
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
