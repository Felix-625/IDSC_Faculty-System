import styles from './Select.module.css';
import { ChevronDown } from 'lucide-react';

export function Select({
  value,
  onChange,
  options = [], // [{ value, label }]
  placeholder,
  className = '',
  id,
  disabled = false,
  ...props
}) {
  return (
    <div className={`${styles.selectWrapper} ${className}`}>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className={styles.arrow} />
    </div>
  );
}
