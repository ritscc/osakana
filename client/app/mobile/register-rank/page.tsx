import { NameInputField } from "./_components/input-field";
import styles from "./page.module.scss";

export default async function Mobile() {
  return (
    <div className={styles.page}>
      <p className={styles.page__title}>ランキング登録</p>
      <NameInputField />
    </div>
  );
}
