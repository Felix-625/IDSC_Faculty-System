import styles from './PageHeader.module.css';

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  badge,
  className = '',
}) {
  return (
    <header className={`${styles.banner} ${className}`}>
      <div className={styles.left}>
        {Icon && (
          <div className={styles.iconTile}>
            <Icon size={24} className={styles.icon} />
          </div>
        )}
        <div className={styles.textContainer}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {badge && <span className={styles.badge}>{badge}</span>}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
