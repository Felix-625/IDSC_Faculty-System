import styles from './Button.module.css';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'outline' | 'ghost' | 'danger-soft' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${
        fullWidth ? styles.fullWidth : ''
      } ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={styles.spinner} size={size === 'sm' ? 14 : 16} />
      ) : (
        Icon && <Icon className={styles.icon} size={size === 'sm' ? 14 : 16} />
      )}
      <span className={styles.label}>{children}</span>
      {!isLoading && IconRight && (
        <IconRight className={styles.iconRight} size={size === 'sm' ? 14 : 16} />
      )}
    </button>
  );
}
