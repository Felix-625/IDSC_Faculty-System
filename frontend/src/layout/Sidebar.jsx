import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { getInitials } from '../utils/format';
import styles from './Sidebar.module.css';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  CalendarDays,
  Wallet,
  Megaphone,
  UserCheck,
  GraduationCap,
  Layers,
  Calendar,
  MoreVertical,
  LogOut,
  X,
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, isDean, isAvp, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`;

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Header / Logo */}
        <div className={styles.header}>
          <div className={styles.logoRow}>
            <img src="/logo.png" alt="IDSC Seal" className={styles.logoImg} />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>IDSC Portal</span>
              <span className={styles.brandSubtitle}>FACULTY SYSTEM</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className={styles.nav} aria-label="Main Navigation">
          <NavLink to="/dashboard" className={navItemClass} onClick={onClose}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {/* AVP Academic Council Menu */}
          {isAvp ? (
            <>
              <div className={styles.groupLabel}>ACADEMIC COUNCIL</div>
              <div className={styles.groupItems}>
                <NavLink to="/avp/deans" className={navItemClass} onClick={onClose}>
                  <UserCheck size={18} />
                  <span>Manage Deans</span>
                </NavLink>
                <NavLink to="/dean/faculty" className={navItemClass} onClick={onClose}>
                  <Users size={18} />
                  <span>Faculty Directory</span>
                </NavLink>
                <NavLink to="/dean/courses" className={navItemClass} onClick={onClose}>
                  <GraduationCap size={18} />
                  <span>College Programs</span>
                </NavLink>
                <NavLink to="/dean/sections" className={navItemClass} onClick={onClose}>
                  <Layers size={18} />
                  <span>Class Sections</span>
                </NavLink>
                <NavLink to="/dean/subjects" className={navItemClass} onClick={onClose}>
                  <BookOpen size={18} />
                  <span>Curriculum Catalog</span>
                </NavLink>
                <NavLink to="/dean/schedule" className={navItemClass} onClick={onClose}>
                  <Calendar size={18} />
                  <span>Institution Schedule</span>
                </NavLink>
                <NavLink to="/dean/announcements" className={navItemClass} onClick={onClose}>
                  <Megaphone size={18} />
                  <span>Council Memoranda</span>
                </NavLink>
              </div>
            </>
          ) : (
            <>
              {/* Instructor Menu */}
              <div className={styles.groupLabel}>INSTRUCTOR MENU</div>
              <div className={styles.groupItems}>
                <NavLink to="/subjects" className={navItemClass} onClick={onClose}>
                  <BookOpen size={18} />
                  <span>My Subjects</span>
                </NavLink>
                <NavLink to="/students" className={navItemClass} onClick={onClose}>
                  <Users size={18} />
                  <span>My Students</span>
                </NavLink>
                <NavLink to="/grades" className={navItemClass} onClick={onClose}>
                  <Award size={18} />
                  <span>Grade Management</span>
                </NavLink>
                <NavLink to="/schedule" className={navItemClass} onClick={onClose}>
                  <CalendarDays size={18} />
                  <span>My Schedule</span>
                </NavLink>
                <NavLink to="/salary" className={navItemClass} onClick={onClose}>
                  <Wallet size={18} />
                  <span>My Salary</span>
                </NavLink>
                <NavLink to="/announcements" className={navItemClass} onClick={onClose}>
                  <Megaphone size={18} />
                  <span>Announcements</span>
                </NavLink>
              </div>

              {/* Dean Management (only visible to DEAN) */}
              {isDean && (
                <>
                  <div className={styles.groupLabel}>DEAN MANAGEMENT</div>
                  <div className={styles.groupItems}>
                    <NavLink to="/dean/faculty" className={navItemClass} onClick={onClose}>
                      <UserCheck size={18} />
                      <span>Manage Faculty</span>
                    </NavLink>
                    <NavLink to="/dean/courses" className={navItemClass} onClick={onClose}>
                      <GraduationCap size={18} />
                      <span>Manage Course</span>
                    </NavLink>
                    <NavLink to="/dean/sections" className={navItemClass} onClick={onClose}>
                      <Layers size={18} />
                      <span>Manage Sections</span>
                    </NavLink>
                    <NavLink to="/dean/subjects" className={navItemClass} onClick={onClose}>
                      <BookOpen size={18} />
                      <span>Manage Subjects</span>
                    </NavLink>
                    <NavLink to="/dean/schedule" className={navItemClass} onClick={onClose}>
                      <Calendar size={18} />
                      <span>Manage Schedule</span>
                    </NavLink>
                    <NavLink to="/dean/announcements" className={navItemClass} onClick={onClose}>
                      <Megaphone size={18} />
                      <span>Manage Announcements</span>
                    </NavLink>
                  </div>
                </>
              )}
            </>
          )}
        </nav>

        {/* User Footer */}
        <div className={styles.footer} ref={menuRef}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{getInitials(user?.name)}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName} title={user?.name}>
                {user?.name || 'Faculty Member'}
              </div>
              <div className={styles.userRole}>
                {user?.position || 'FACULTY'} · {user?.department || 'IT'}
              </div>
            </div>
            <button
              type="button"
              className={styles.kebabBtn}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="User menu"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical size={18} />
            </button>
          </div>

          {/* Kebab Dropdown Menu */}
          {isMenuOpen && (
            <div className={styles.menuDropdown} role="menu">
              <button
                type="button"
                className={styles.menuItem}
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
