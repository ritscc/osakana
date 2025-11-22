import React from "react";
import styles from "./styles.module.scss";

interface BubbleContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function BubbleContainer({ children, className = "" }: BubbleContainerProps) {
  return (
    <div
      className={`${styles.container} ${className}`}
    >
      {/* 泡の反射効果用ハイライト */}
      <div className={styles.highlightTop} />
      <div className={styles.highlightBottom} />
      
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
