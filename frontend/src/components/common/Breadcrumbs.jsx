import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({
  items = [], // [{ label, to? }]
  className = '',
}) {
  return (
    <nav aria-label="Breadcrumb" className={`${styles.nav} ${className}`}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={styles.item}>
              {index > 0 && <ChevronRight size={14} className={styles.separator} />}
              {isLast || !item.to ? (
                <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
