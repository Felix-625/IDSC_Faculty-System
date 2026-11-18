import { useState, useCallback } from 'react';
import { ToastContext } from './toastContextDef';
import styles from './Toast.module.css';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      message: toast.message || '',
      detail: toast.detail || '',
      duration: toast.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message, detail) => addToast({ type: 'success', message, detail }),
    [addToast]
  );
  const error = useCallback(
    (message, detail) => addToast({ type: 'error', message, detail }),
    [addToast]
  );
  const warning = useCallback(
    (message, detail) => addToast({ type: 'warning', message, detail }),
    [addToast]
  );
  const info = useCallback(
    (message, detail) => addToast({ type: 'info', message, detail }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className={styles.toastContainer} role="region" aria-label="Notifications">
        {toasts.map((t) => {
          let Icon = Info;
          if (t.type === 'success') Icon = CheckCircle2;
          else if (t.type === 'error') Icon = AlertCircle;
          else if (t.type === 'warning') Icon = AlertTriangle;

          return (
            <div
              key={t.id}
              className={`${styles.toast} ${styles[t.type]}`}
              role="status"
              aria-live="polite"
            >
              <Icon size={20} className={styles.icon} />
              <div className={styles.content}>
                <div className={styles.message}>{t.message}</div>
                {t.detail && <div className={styles.detail}>{t.detail}</div>}
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
