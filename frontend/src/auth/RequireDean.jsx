import { Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import styles from './RequireDean.module.css';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function RequireDean({ children }) {
  const { isDean } = useAuth();

  if (!isDean) {
    return (
      <div className={styles.forbiddenContainer}>
        <div className={styles.card}>
          <div className={styles.iconCircle}>
            <ShieldAlert size={40} className={styles.icon} />
          </div>
          <h1 className={styles.title}>403 – Access Denied</h1>
          <p className={styles.message}>
            You do not have permission to access Dean Management screens. This area is restricted to Dean accounts.
          </p>
          <Link to="/dashboard" className={styles.backButton}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
