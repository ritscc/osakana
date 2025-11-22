import KanjiSplitter from "../KanjiSplitter"
import BubbleContainer from "../BubbleContainer"
import styles from "./styles.module.scss"

type kanjiProps = {
  unicode: number
  kanji: string
  yomi: string
  difficulty: number
  animationState?: "idle" | "entering" | "exiting"
  index?: number
  isCorrect?: boolean
}

export default function Kanji({ 
  unicode, 
  kanji, 
  yomi, 
  difficulty,
  animationState = "idle",
  index = 0,
  isCorrect = false
}: kanjiProps) {
  const staggerDelay = index * 0.15;
  const yomiExitDelay = staggerDelay + 0.3;
  const enterBaseDelay = 1.05;
  const bubbleEnterDelay = staggerDelay + enterBaseDelay;
  const yomiEnterTotalDelay = 1.35 + 1.2 + enterBaseDelay;

  return (
    <div className={`${styles.container} ${isCorrect ? styles.containerCorrect : ""}`}>
      <div 
        className={`${styles.yomi} ${
          animationState === "exiting" ? styles.exitingYomi : 
          animationState === "entering" ? styles.enteringYomi : ""
        }`}
        style={{
          animationDelay: animationState === "exiting" 
            ? `${yomiExitDelay}s` 
            : animationState === "entering" 
              ? `${yomiEnterTotalDelay}s` 
              : "0s"
        }}
      >
        {yomi}
      </div>

      <BubbleContainer 
        className={`${styles.bubble} ${
          animationState === "exiting" ? styles.exitingBubble : 
          animationState === "entering" ? styles.enteringBubble : ""
        }`}
        style={{
          animationDelay: animationState === "exiting" 
            ? `${staggerDelay}s` 
            : animationState === "entering" 
              ? `${bubbleEnterDelay}s` 
              : "0s"
        }}
        isCorrect={isCorrect}
      >
        <KanjiSplitter
          kanji={kanji}
          isHidden={!isCorrect}
          width="70%"
          className={styles.splitter}
        />
      </BubbleContainer>
    </div>
  )
}
