import { Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import styles from './RequireDean.module.css';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function RequireAvp({ children }) {
  const { isAvp } = useAuth();

  if (!isAvp) {
    return (
      <div className={styles.forbiddenContainer}>
        <div className={styles.card}>
          <div className={styles.iconCircle}>
            <ShieldAlert size={40} className={styles.icon} />
          </div>
          <h1 className={styles.title}>403 – Access Denied</h1>
          <p className={styles.message}>
            You do not have permission to access the AVP Academic Council portal. This area is restricted to the Academic Vice President.
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
