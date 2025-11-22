import KanjiSplitter from "../KanjiSplitter"
import BubbleContainer from "../BubbleContainer"
import styles from "./styles.module.scss"

type kanjiProps = {
  questionnum: number
  answerkanji: string
  yomikanji: string
  description: string
}

export default function Kanji({ questionnum, answerkanji, yomikanji, description }: kanjiProps) {
  return (
    <div className={styles.container}>
      {/* 読み */}
      <div className={styles.yomi}>
        {yomikanji}
      </div>

      {/* 漢字を表示する泡 */}
      <BubbleContainer className={styles.bubble}>
        <KanjiSplitter
          char={answerkanji}
          isHidden={true}
          width="70%"
        />
      </BubbleContainer>
    </div>
  )
}
