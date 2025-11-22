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
}

export default function Kanji({ 
  unicode, 
  kanji, 
  yomi, 
  difficulty,
  animationState = "idle",
  index = 0
}: kanjiProps) {
  const staggerDelay = index * 0.15;
  const yomiExitDelay = staggerDelay + 0.3; // 泡が重なるまで少し待つ
  const enterBaseDelay = 1.05;
  const bubbleEnterDelay = staggerDelay + enterBaseDelay;
  const yomiEnterTotalDelay = 1.35 + 1.2 + enterBaseDelay;

  return (
    <div className={styles.container}>
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
      >
        <KanjiSplitter
          kanji={kanji}
          isHidden={true}
          width="70%"
        />
      </BubbleContainer>
    </div>
  )
}
