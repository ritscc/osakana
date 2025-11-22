import styles from './styles.module.scss';

interface TimeGaugeProps {
  /**
   * Remaining time percentage (0-100)
   */
  progress: number;
}

export default function TimeGauge({ progress }: TimeGaugeProps) {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const isWarning = clampedProgress <= 20;

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.bar} ${isWarning ? styles.warning : ''}`} 
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
