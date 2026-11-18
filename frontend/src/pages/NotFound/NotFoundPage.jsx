import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: '16px',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-heading)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={Home}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
