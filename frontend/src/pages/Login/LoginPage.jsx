import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import styles from './LoginPage.module.css';
import { Eye, EyeOff, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

export function LoginPage() {
  const { login, logoutMessage, clearLogoutMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facultyId.trim() || !password) {
      setErrorMessage('Please enter both Faculty ID and password.');
      return;
    }

    setErrorMessage(null);
    clearLogoutMessage();
    setIsLoading(true);

    try {
      await login(facultyId.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 401) {
        setErrorMessage('Invalid Faculty ID or password.');
      } else if (err.status === 403) {
        setErrorMessage('This account is not active.');
      } else if (err.status === 0) {
        setErrorMessage('Cannot reach the server. Please verify the backend is running.');
      } else {
        setErrorMessage(err.detail || 'An error occurred while signing in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (id, pw) => {
    setFacultyId(id);
    setPassword(pw);
    setErrorMessage(null);
  };

  const isDev = import.meta.env.DEV;

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="/logo.png" alt="IDSC Seal" className={styles.logo} />
          <h1 className={styles.title}>IDSC Portal</h1>
          <p className={styles.subtitle}>FACULTY SYSTEM</p>
        </div>

        {logoutMessage && (
          <div className={styles.alertInfo} role="alert">
            <Info size={18} />
            <span>{logoutMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className={styles.alertDanger} role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="Faculty ID" id="facultyId" required>
            <input
              id="facultyId"
              type="text"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              placeholder="e.g. FAC-2026-001"
              autoComplete="username"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Password" id="password" required>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            Sign in
          </Button>
        </form>

        {isDev && (
          <div className={styles.demoSection}>
            <button
              type="button"
              className={styles.demoToggle}
              onClick={() => setShowDemoAccounts((prev) => !prev)}
            >
              <span>Demo accounts (dev only)</span>
              {showDemoAccounts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDemoAccounts && (
              <div className={styles.demoList}>
                <div
                  className={styles.demoItem}
                  onClick={() => handleSelectDemo('FAC-2026-001', 'Password123!')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.demoRole}>DEAN</div>
                  <div className={styles.demoName}>Maria Dela Cruz</div>
                  <div className={styles.demoId}>FAC-2026-001</div>
                </div>

                <div
                  className={styles.demoItem}
                  onClick={() => handleSelectDemo('FAC-2026-002', 'Password123!')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.demoRole}>FACULTY</div>
                  <div className={styles.demoName}>Juan Reyes</div>
                  <div className={styles.demoId}>FAC-2026-002</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
