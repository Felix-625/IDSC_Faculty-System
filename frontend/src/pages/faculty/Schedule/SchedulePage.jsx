import { useMemo } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { useFacultySchedule, useFacultySubjects } from '../../../hooks/useFacultyData';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatTimeRange } from '../../../utils/format';
import { ErrorState } from '../../../components/common/ErrorState';
import styles from './SchedulePage.module.css';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

export function SchedulePage() {
  const { user } = useAuth();
  const facultyId = user?.facultyId;

  const {
    data: schedule = [],
    isLoading: isLoadingSchedule,
    isError: isScheduleError,
    refetch,
  } = useFacultySchedule(facultyId);

  const { data: assignments = [], isLoading: isLoadingSubjects } = useFacultySubjects(facultyId);

  const currentWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  // Join courseName from assignments and sort by Day then StartTime
  const tableData = useMemo(() => {
    const enriched = schedule.map((item) => {
      const match = assignments.find(
        (a) => a.assignmentId === item.assignmentId || a.courseCode === item.courseCode
      );
      return {
        ...item,
        courseName: match?.courseName || item.courseCode,
      };
    });

    enriched.sort((a, b) => {
      const dayDiff = (DAY_ORDER[a.day] || 99) - (DAY_ORDER[b.day] || 99);
      if (dayDiff !== 0) return dayDiff;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    return enriched;
  }, [schedule, assignments]);

  const columns = [
    {
      key: 'day',
      header: 'Day',
      width: '130px',
      render: (row) => (
        <div className={styles.dayCell}>
          <span className={styles.dayName}>{row.day}</span>
          {row.day.toLowerCase() === currentWeekday.toLowerCase() && (
            <span className={styles.todayIndicator}>Today</span>
          )}
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Time',
      width: '180px',
      render: (row) => (
        <div className={styles.timeCell}>
          <Clock size={14} className={styles.timeIcon} />
          <span>{formatTimeRange(row.startTime, row.endTime)}</span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (row) => (
        <div className={styles.subjectCell}>
          <span className={styles.subjectCode}>{row.courseCode}</span>
          <span className={styles.subjectDivider}>—</span>
          <span className={styles.subjectName}>{row.courseName}</span>
        </div>
      ),
    },
    {
      key: 'section',
      header: 'Section',
      width: '140px',
      render: (row) => <span className={styles.sectionBadge}>{row.section}</span>,
    },
    {
      key: 'room',
      header: 'Room',
      width: '140px',
      render: (row) => (
        <div className={styles.roomCell}>
          <MapPin size={14} className={styles.roomIcon} />
          <span>{row.room || 'TBA'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      align: 'right',
      render: () => <StatusChip status="Scheduled" variant="info" />,
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="My Schedules"
        subtitle="View your weekly timetable and assigned teaching hours."
        icon={CalendarDays}
      />

      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Weekly Schedule</h2>
          <p className={styles.cardCaption}>Monday to Saturday teaching periods</p>
        </div>
        <div className={styles.countBadge}>{tableData.length} Scheduled Classes</div>
      </div>

      {isScheduleError ? (
        <ErrorState
          title="Could not load your schedule"
          message="Failed to retrieve schedule entries from the server."
          onRetry={refetch}
        />
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          keyField="scheduleId"
          isLoading={isLoadingSchedule || isLoadingSubjects}
          emptyMessage="No classes scheduled yet."
          highlightRowKey={(row) => row.day.toLowerCase() === currentWeekday.toLowerCase()}
        />
      )}
    </div>
  );
}
