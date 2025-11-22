"use client";

import { useState } from "react";
import { registerRanking } from "../../actions";

export function NameInputField() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await registerRanking(formData);
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error("登録エラー:", error);
      alert(`エラーが発生しました: ${(error as Error).message}`);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <h2>登録成功！</h2>
        <p>ユーザー登録が完了しました。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="input">名前を入力</label>
        <input
          id="input"
          name="input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          placeholder="名前を入力してください"
        />
      </div>
      <button type="submit" disabled={loading || !name}>
        {loading ? "登録中..." : "確定"}
      </button>
    </form>
  );
}
