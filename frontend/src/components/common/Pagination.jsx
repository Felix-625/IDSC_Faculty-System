import styles from './Pagination.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className={`${styles.pagination} ${className}`}>
      <div className={styles.rangeText}>
        Showing <span className={styles.bold}>{startItem}</span>–
        <span className={styles.bold}>{endItem}</span> of{' '}
        <span className={styles.bold}>{totalItems}</span>
      </div>

      <div className={styles.actions}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <span className={styles.pageIndicator}>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          iconRight={ChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
