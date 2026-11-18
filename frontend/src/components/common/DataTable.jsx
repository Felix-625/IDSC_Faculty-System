import styles from './DataTable.module.css';

export function DataTable({
  columns, // [{ key, header, render?, width?, align? }]
  data = [],
  keyField = 'id',
  isLoading = false,
  emptyMessage = 'No records found',
  emptyComponent,
  highlightRowKey,
  onRowClick,
  className = '',
}) {
  return (
    <div className={`${styles.tableCard} ${className}`}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                  }}
                  className={styles.th}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className={styles.skeletonRow}>
                  {columns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      <div className={styles.skeletonCell} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyTd}>
                  {emptyComponent || <div className={styles.emptyText}>{emptyMessage}</div>}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = item[keyField] ?? index;
                const isHighlighted = highlightRowKey && highlightRowKey(item);
                return (
                  <tr
                    key={key}
                    className={`${styles.tr} ${isHighlighted ? styles.highlighted : ''} ${
                      onRowClick ? styles.clickable : ''
                    }`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align || 'left' }}
                        className={styles.td}
                      >
                        {col.render ? col.render(item, index) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
