"use client";

import styles from "./combo.module.css";

export function Combo(props: { combo: number }) {
  const { combo } = props;

  return (
    <div className={styles.container}>
      <span
        className={`${styles.comboNumber} ${combo > 0 ? styles.animate : ""}`}
      >
        {combo}
      </span>
      <span
        className={`${styles.comboText} ${combo > 0 ? styles.animate : ""}`}
      >
        COMBO
      </span>
    </div>
  );
}
