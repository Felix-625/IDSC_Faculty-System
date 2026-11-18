import styles from './StatusChip.module.css';

export function StatusChip({
  status,
  variant, // 'success' | 'warning' | 'info' | 'danger' | 'neutral'
  label,
  size = 'md', // 'sm' | 'md'
  uppercase = true,
  className = '',
}) {
  const normalized = String(status || '').toUpperCase();

  let resolvedVariant = variant;
  if (!resolvedVariant) {
    if (['ACTIVE', 'POSTED', 'ASSIGNED', 'FULL_TIME', 'ENROLLED'].includes(normalized)) {
      resolvedVariant = 'success';
    } else if (['PENDING', 'ON_LEAVE', 'WARNING'].includes(normalized)) {
      resolvedVariant = 'warning';
    } else if (['UPDATED', 'SCHEDULED', 'PART_TIME', 'INFO'].includes(normalized)) {
      resolvedVariant = 'info';
    } else if (['INACTIVE', 'RESIGNED', 'DROPPED', 'CANCELLED', 'DANGER'].includes(normalized)) {
      resolvedVariant = 'danger';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  const displayText = label || (status ? status.replace(/_/g, ' ') : '');

  return (
    <span
      className={`${styles.chip} ${styles[resolvedVariant]} ${styles[size]} ${
        uppercase ? styles.uppercase : ''
      } ${className}`}
    >
      <span className={styles.dot} />
      {displayText}
    </span>
  );
}
