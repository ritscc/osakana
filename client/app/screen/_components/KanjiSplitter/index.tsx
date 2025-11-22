"use client";

import { useEffect, useState } from 'react';
import styles from "./styles.module.scss";

interface KanjiSplitterProps {
  kanji?: string;
  width?: number | string;
  isHidden?: boolean;
  className?: string;
  variant?: "split" | "static";
}

// SVGデータのキャッシュ
const svgCache: Record<string, string> = {};

export default function KanjiSplitter({
  kanji = "鰯",
  width = 128,
  isHidden = true,
  className = "",
  variant = "split"
}: KanjiSplitterProps) {
  const [svgContent, setSvgContent] = useState<string | null>(kanji ? (svgCache[kanji] || null) : null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchKanji = async () => {
      try {
        setError(false);
        if (!kanji) return;
        
        if (svgCache[kanji]) {
          if (isMounted) setSvgContent(svgCache[kanji]);
          return;
        }

        const codePoint = kanji.codePointAt(0);
        if (codePoint === undefined) throw new Error("Invalid character");

        const hex = codePoint.toString(16).padStart(5, '0');
        const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("SVG Data not found");
        const text = await response.text();

        const start = text.indexOf('<svg');
        const cleanSvg = start > -1 ? text.substring(start) : text;

        svgCache[kanji] = cleanSvg;

        if (isMounted) setSvgContent(cleanSvg);
      } catch (err) {
        console.error(err);
        if (isMounted) setError(true);
      }
    };
    fetchKanji();
    return () => { isMounted = false; };
  }, [kanji]);

  if (error) return <div className={styles.error}>Error</div>;
  if (!svgContent) {
    return (
      <div
        className={styles.loading}
        style={{ width, height: width }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        style={{ width, height: width }}
        className={`${styles.svgContainer} ${
          variant === "static"
            ? styles.visibleRight
            : isHidden
              ? styles.hiddenRight
              : styles.visibleRight
        }`}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

    </div>
  );
}
