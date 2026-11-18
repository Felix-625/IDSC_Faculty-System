import { useAuth } from '../../../auth/useAuth';
import { useSessionTimer } from '../../../auth/useSessionTimer';
import { useFacultySubjects, useFacultySchedule } from '../../../hooks/useFacultyData';
import { useFacultyStats } from '../../../hooks/useFacultyStats';
import { useAnnouncementsRead } from '../../../hooks/useAnnouncementsRead';
import { CURRENT_TERM } from '../../../config/academicTerm';
import { formatTimeRange } from '../../../utils/format';
import { MetricCard } from '../../../components/common/MetricCard';
import styles from './DashboardPage.module.css';
import {
  ShieldCheck,
  Clock,
  Users,
  BookOpen,
  CalendarDays,
  Award,
  ChevronRight,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function FacultyDashboardPage() {
  const { user } = useAuth();
  const { formattedTime } = useSessionTimer();

  const facultyId = user?.facultyId;
  const { data: assignments = [], isLoading: isLoadingSubjects } = useFacultySubjects(facultyId);
  const { data: schedule = [], isLoading: isLoadingSchedule } = useFacultySchedule(facultyId);
  const { totalStudents, pendingGrades, isLoading: isLoadingStats } = useFacultyStats(
    facultyId,
    assignments
  );
  const { announcements } = useAnnouncementsRead();

  const todayDate = new Date();
  const currentWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(todayDate);
  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(todayDate);

  // Filter schedule for today
  const todayClasses = schedule.filter(
    (item) => item.day.toLowerCase() === currentWeekday.toLowerCase()
  );

  // Latest 2 announcements
  const latestAnnouncements = announcements.slice(0, 2);

  return (
    <div className={styles.dashboardContainer}>
      {/* Hero Welcome Banner */}
      <section className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>Welcome to IDSC Faculty Portal</h1>
      </section>

      {/* Signed-in / Session Strip */}
      <div className={styles.sessionStrip}>
        <div className={styles.sessionUser}>
          <ShieldCheck size={20} className={styles.shieldIcon} />
          <span>
            Signed in as <strong>{user?.name}</strong> · Faculty
          </span>
        </div>
        <div className={styles.sessionTimer}>
          <Clock size={16} />
          <span>SESSION {formattedTime}</span>
        </div>
      </div>

      {/* Subtitle Line */}
      <div className={styles.termSubtitle}>
        Overview of faculty operations for {CURRENT_TERM.semester}, AY {CURRENT_TERM.academicYear}
      </div>

      {/* 4 Metric Cards */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          caption="Across enrolled sections"
          isLoading={isLoadingSubjects || isLoadingStats}
        />
        <MetricCard
          title="My Subjects"
          value={assignments.length}
          icon={BookOpen}
          caption="Assigned courses this term"
          isLoading={isLoadingSubjects}
        />
        <MetricCard
          title="My Schedule"
          value={schedule.length}
          icon={CalendarDays}
          caption="Total weekly periods"
          isLoading={isLoadingSchedule}
        />
        <MetricCard
          title="Pending Grades"
          value={pendingGrades}
          icon={Award}
          caption="Students awaiting grade submission"
          isLoading={isLoadingSubjects || isLoadingStats}
        />
      </div>

      {/* Dashboard Lower Grid: Today's Schedule & Latest Announcements */}
      <div className={styles.contentGrid}>
        {/* Today's Schedule Panel */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Today's Schedule</h2>
              <p className={styles.panelSubtitle}>{formattedToday}</p>
            </div>
            <Link to="/schedule" className={styles.viewTimetableLink}>
              View timetable →
            </Link>
          </div>

          <div className={styles.scheduleList}>
            {isLoadingSchedule ? (
              <div className={styles.emptySchedule}>Loading schedule...</div>
            ) : todayClasses.length === 0 ? (
              <div className={styles.emptySchedule}>
                <CalendarDays size={32} className={styles.emptyIcon} />
                <p>No classes today</p>
                <span>Enjoy your day or prepare class materials!</span>
              </div>
            ) : (
              todayClasses.map((item) => {
                const matchedAssignment = assignments.find(
                  (a) => a.assignmentId === item.assignmentId || a.courseCode === item.courseCode
                );
                const courseName = matchedAssignment?.courseName || item.courseCode;

                return (
                  <Link
                    key={item.scheduleId}
                    to="/schedule"
                    className={styles.scheduleRow}
                  >
                    <div className={styles.timeBadge}>
                      {formatTimeRange(item.startTime, item.endTime)}
                    </div>
                    <div className={styles.scheduleDetails}>
                      <div className={styles.subjectLine}>
                        <span className={styles.code}>{item.courseCode}</span>
                        <span className={styles.dot}>·</span>
                        <span className={styles.name}>{courseName}</span>
                      </div>
                      <div className={styles.locationLine}>
                        {item.section} · Room {item.room || 'TBA'}
                      </div>
                    </div>
                    <ChevronRight size={18} className={styles.chevron} />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Latest Announcements Panel (Blue Gradient) */}
        <div className={styles.announcementPanel}>
          <div className={styles.announcementHeader}>
            <div className={styles.announcementTitleRow}>
              <Megaphone size={20} />
              <span className={styles.announcementLabel}>LATEST ANNOUNCEMENTS</span>
            </div>
            <Link to="/announcements" className={styles.announcementViewAll}>
              All Announcements <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.announcementList}>
            {latestAnnouncements.length === 0 ? (
              <div className={styles.announcementEmpty}>No current announcements.</div>
            ) : (
              latestAnnouncements.map((item) => (
                <Link
                  key={item.announcementId}
                  to={`/announcements/${item.announcementId}`}
                  className={styles.announcementItem}
                >
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemPreview}>
                    {item.content.length > 120
                      ? `${item.content.substring(0, 120)}...`
                      : item.content}
                  </p>
                  <div className={styles.itemFooter}>
                    <span>Read update →</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
