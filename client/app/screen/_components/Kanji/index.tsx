import KanjiSplitter from "../KanjiSplitter"
import BubbleContainer from "../BubbleContainer"
import styles from "./styles.module.scss"

type kanjiProps = {
  unicode: number
  kanji: string
  yomi: string
  difficulty: number
}

export default function Kanji({ unicode, kanji, yomi, difficulty }: kanjiProps) {
  return (
    <div className={styles.container}>
      {/* 読み */}
      <div className={styles.yomi}>
        {yomi}
      </div>

      {/* 漢字を表示する泡 */}
      <BubbleContainer className={styles.bubble}>
        <KanjiSplitter
          kanji={kanji}
          isHidden={true}
          width="70%"
        />
      </BubbleContainer>
    </div>
  )
}
