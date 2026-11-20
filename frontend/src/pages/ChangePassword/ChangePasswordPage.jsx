import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/common/useToast';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import styles from './ChangePasswordPage.module.css';

const MIN_LENGTH = 8;

export function ChangePasswordPage() {
  const { changePassword, mustChangePassword } = useAuth();
  const { success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'Please fill in all fields.';
    }
    if (newPassword.length < MIN_LENGTH) {
      return `New password must be at least ${MIN_LENGTH} characters.`;
    }
    if (newPassword === currentPassword) {
      return 'New password must be different from your current password.';
    }
    if (newPassword !== confirmPassword) {
      return 'New password and confirmation do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setErrorMessage(problem);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toastSuccess('Password changed', 'Your new password is now active.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.status === 401) {
        setErrorMessage('Your current password is incorrect.');
      } else if (err.status === 0) {
        setErrorMessage('Cannot reach the server. Please check your connection.');
      } else {
        setErrorMessage(err.detail || 'Could not change your password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <div className={styles.page}>
      <PageHeader
        title="Change Password"
        subtitle="Choose a new password that only you know."
        icon={Lock}
      />

      <div className={styles.card}>
        {mustChangePassword && (
          <div className={styles.alertWarning} role="alert">
            <ShieldAlert size={18} />
            <span>
              You are using a temporary password. Please set your own password to continue.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className={styles.alertDanger} role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField
            label={mustChangePassword ? 'Temporary password' : 'Current password'}
            id="currentPassword"
            required
          >
            <input
              id="currentPassword"
              type={inputType}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
            />
          </FormField>

          <FormField
            label="New password"
            id="newPassword"
            helpText={`At least ${MIN_LENGTH} characters.`}
            required
          >
            <input
              id="newPassword"
              type={inputType}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Confirm new password" id="confirmPassword" required>
            <input
              id="confirmPassword"
              type={inputType}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isLoading}
            />
          </FormField>

          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPasswords((prev) => !prev)}
          >
            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
          </button>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
            Save new password
          </Button>
        </form>
      </div>
    </div>
  );
}