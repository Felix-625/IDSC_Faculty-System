import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useAnnouncementsRead } from '../hooks/useAnnouncementsRead';
import { getInitials } from '../utils/format';
import styles from './TopBar.module.css';
import { Menu, Bell } from 'lucide-react';

export function TopBar({ onToggleSidebar }) {
  const { user } = useAuth();
  const { unreadCount } = useAnnouncementsRead();

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className={styles.right}>
        {/* Bell Icon with badge linking to /announcements */}
        <Link to="/announcements" className={styles.bellBtn} aria-label="Announcements">
          <Bell size={20} className={styles.bellIcon} />
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </Link>

        {/* Vertical divider */}
        <div className={styles.divider} />

        {/* User avatar and name */}
        <div className={styles.userProfile}>
          <span className={styles.userName}>{user?.name || 'Faculty Member'}</span>
          <div className={styles.avatar}>{getInitials(user?.name)}</div>
        </div>
      </div>
    </header>
  );
}
