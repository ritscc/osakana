export type KanjiDifficulty = "Easy" | "Medium" | "Hard";

export interface ServerKanji {
  unicode: string;
  yomi: string;
  kanji: string;
  difficulty: KanjiDifficulty;
}

export interface ServerQuestion {
  index: number;
  kanji: ServerKanji;
  is_solved: boolean;
}

export interface SerializedDuration {
  secs: number;
  nanos: number;
}

export interface ServerQuestionsPayload {
  current: ServerQuestion[];
  remaining_time: SerializedDuration;
}

export interface GetCurrentQuestionsResponse {
  current_questions: ServerQuestion[];
}

export type ReloadQuestionsEvent = {
  ReloadQuestions: {
    questions: ServerQuestionsPayload;
  };
};

export type RemainingTimePercentageEvent = {
  RemainingTimePercentage: {
    percentage: number;
  };
};

export type AnswerEvent = {
  Answer: {
    index: number;
    is_correct: boolean;
  };
};

export type SseEventPayload =
  | ReloadQuestionsEvent
  | RemainingTimePercentageEvent
  | AnswerEvent;

export interface ScreenQuestion {
  index: number;
  unicode: number;
  unicodeHex: string;
  yomi: string;
  kanji: string;
  difficulty: number;
}

