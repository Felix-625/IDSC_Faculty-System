import styles from './ErrorState.module.css';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Failed to load data',
  message = 'An error occurred while communicating with the server.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`${styles.errorCard} ${className}`} role="alert">
      <div className={styles.iconCircle}>
        <AlertCircle size={28} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          className={styles.retryBtn}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
