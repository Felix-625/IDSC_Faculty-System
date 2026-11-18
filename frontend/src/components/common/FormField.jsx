import styles from './FormField.module.css';

export function FormField({
  label,
  id,
  required = false,
  error,
  helpText,
  children,
  className = '',
}) {
  return (
    <div className={`${styles.fieldGroup} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.requiredStar}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>{children}</div>
      {error && <p className={styles.errorText}>{error}</p>}
      {!error && helpText && <p className={styles.helpText}>{helpText}</p>}
    </div>
  );
}
