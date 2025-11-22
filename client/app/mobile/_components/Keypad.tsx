// app/mobile/_components/Keypad.tsx
"use client";

import { useState, useMemo } from "react";
import { saveIndexToCookie } from "../actions";

export function Keypad() {
  // 1から10までの固定番号を生成
  const numbers = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i + 1),
    [],
  );

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleNumberSelect = async (number: number) => {
    if (isSaving) {
      return;
    }

    const problemNumber = String(number);

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("input", problemNumber);

      await saveIndexToCookie(formData);

      setSelectedNumber(number);
    } catch (error) {
      // エラーログやメッセージは削除済み
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="keypad-container"
      style={{
        maxWidth: "400px",
        margin: "auto",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", // 👈 3列表示に変更
          gap: "15px",
          maxWidth: "300px", // 3列に合わせた幅に変更
          margin: "0 auto",
        }}
      >
        {numbers.map((number) => (
          <button
            key={number}
            onClick={() => handleNumberSelect(number)}
            disabled={isSaving}
            style={{
              padding: "20px 10px",
              fontSize: "1.5em",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              cursor: isSaving ? "not-allowed" : "pointer",

              // 👇 10番目のボタンを中央に配置するスタイルを追加
              ...(number === 10
                ? {
                  gridColumnStart: "2", // 2列目から開始 (中央)
                  gridColumnEnd: "span 1", // 1列分を占有
                }
                : {}),

              backgroundColor:
                selectedNumber === number
                  ? "#9e9e9e" // 選択中: グレー
                  : "#42a5f5", // 未選択: 青
              color: selectedNumber === number ? "#333" : "white",
              boxShadow: "0 4px 6px rgba(0,0=0,0.1)",
            }}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}
