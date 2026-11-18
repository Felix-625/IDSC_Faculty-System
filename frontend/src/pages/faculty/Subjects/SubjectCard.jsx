import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEnrolledStudents } from '../../../api/students';
import { formatTimeRange } from '../../../utils/format';
import styles from './SubjectCard.module.css';
import {
  Users,
  Award,
  CalendarDays,
  Info,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export function SubjectCard({ assignment, schedule = [], onOpenDetails }) {
  // Query student count for this offering
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: [
      'students',
      assignment.facultyId,
      assignment.courseCode,
      assignment.section,
      assignment.semester,
      assignment.academicYear,
    ],
    queryFn: () =>
      getEnrolledStudents(assignment.facultyId, assignment.courseCode, {
        section: assignment.section,
        semester: assignment.semester,
        academicYear: assignment.academicYear,
      }),
    enabled: Boolean(assignment.facultyId && assignment.courseCode),
  });

  // Find schedule items matching this assignment
  const matchedSchedules = schedule.filter(
    (s) =>
      s.assignmentId === assignment.assignmentId ||
      (s.courseCode === assignment.courseCode && s.section === assignment.section)
  );

  // Format day/time summary, e.g. "Mon • 7:00 AM–10:00 AM" or "Mon, Wed • 7:00 AM–10:00 AM"
  let scheduleSummary = 'Schedule TBA';
  let roomSummary = 'Room TBA';

  if (matchedSchedules.length > 0) {
    const days = matchedSchedules.map((s) => s.day.substring(0, 3)).join(' + ');
    const time = formatTimeRange(matchedSchedules[0].startTime, matchedSchedules[0].endTime);
    scheduleSummary = `${days} • ${time}`;
    roomSummary = matchedSchedules[0].room ? `Room ${matchedSchedules[0].room}` : 'Room TBA';
  }

  const gradesLink = `/grades?assignmentId=${encodeURIComponent(assignment.assignmentId)}`;
  const studentsLink = `/students?assignmentId=${encodeURIComponent(assignment.assignmentId)}`;

  return (
    <div className={styles.card}>
      {/* Dark-green top strip */}
      <div className={styles.topStrip}>
        <span className={styles.codeChip}>{assignment.courseCode}</span>
        <span className={styles.unitsText}>{assignment.units} Units</span>
      </div>

      <div className={styles.content}>
        <div className={styles.subjectHeader}>
          <h3 className={styles.subjectName}>{assignment.courseName}</h3>
          <span className={styles.sectionBadge}>{assignment.section}</span>
        </div>

        {/* Schedule & Location */}
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <Clock size={15} className={styles.metaIcon} />
            <span>{scheduleSummary}</span>
          </div>
          <div className={styles.metaItem}>
            <MapPin size={15} className={styles.metaIcon} />
            <span>{roomSummary}</span>
          </div>
        </div>

        {/* Student Count */}
        <div className={styles.studentsRow}>
          <Users size={16} className={styles.studentsIcon} />
          <span className={styles.studentsCount}>
            {isLoadingStudents ? '...' : students.length} Enrolled Students
          </span>
        </div>

        {/* 4 Quick Action Tiles */}
        <div className={styles.actionTiles}>
          <Link to={studentsLink} className={styles.tile} title="View Students">
            <Users size={16} />
            <span>Students</span>
          </Link>
          <Link to={gradesLink} className={styles.tile} title="Manage Grades">
            <Award size={16} />
            <span>Grades</span>
          </Link>
          <Link to="/schedule" className={styles.tile} title="View Schedule">
            <CalendarDays size={16} />
            <span>Schedule</span>
          </Link>
          <button
            type="button"
            className={styles.tile}
            onClick={() => onOpenDetails(assignment)}
            title="Course Details"
          >
            <Info size={16} />
            <span>Details</span>
          </button>
        </div>

        {/* Full-width View Subject button */}
        <Link to={gradesLink} className={styles.viewButton}>
          <span>View Subject</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
