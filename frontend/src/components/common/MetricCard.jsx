import styles from './MetricCard.module.css';

export function MetricCard({
  title,
  value,
  icon: Icon,
  caption,
  trend,
  className = '',
  isLoading = false,
}) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.topRow}>
        <span className={styles.title}>{title}</span>
        {Icon && (
          <div className={styles.iconCircle}>
            <Icon size={20} className={styles.icon} />
          </div>
        )}
      </div>
      <div className={styles.valueRow}>
        {isLoading ? (
          <div className={styles.skeletonValue} />
        ) : (
          <span className={styles.value}>{value ?? 0}</span>
        )}
      </div>
      {(caption || trend) && (
        <div className={styles.captionRow}>
          {trend && <span className={styles.trend}>{trend}</span>}
          {caption && <span className={styles.caption}>{caption}</span>}
        </div>
      )}
    </div>
  );
}
