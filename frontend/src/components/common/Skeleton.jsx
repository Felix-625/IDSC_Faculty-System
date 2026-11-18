import styles from './Skeleton.module.css';

export function Skeleton({
  width,
  height,
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`}>
      <Skeleton height="20px" width="45%" />
      <div className={styles.lines}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height="14px" width={i === lines - 1 ? '60%' : '100%'} />
        ))}
      </div>
    </div>
  );
}
