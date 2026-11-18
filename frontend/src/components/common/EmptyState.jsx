import styles from './EmptyState.module.css';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No records found',
  description = 'There is currently no data to display.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`${styles.emptyContainer} ${className}`}>
      <div className={styles.iconCircle}>
        <Icon size={32} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className={styles.actionBtn}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
