import styles from './SearchInput.module.css';
import { Search, X } from 'lucide-react';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  id,
  ...props
}) {
  return (
    <div className={`${styles.searchWrapper} ${className}`}>
      <Search size={16} className={styles.searchIcon} />
      <input
        id={id}
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
