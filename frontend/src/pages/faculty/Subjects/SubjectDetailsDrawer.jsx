import { useCourseDetails } from '../../../hooks/useFacultyData';
import { formatDate } from '../../../utils/format';
import { StatusChip } from '../../../components/common/StatusChip';
import { Button } from '../../../components/common/Button';
import styles from './SubjectDetailsDrawer.module.css';
import { X, BookOpen, Layers, Calendar } from 'lucide-react';

export function SubjectDetailsDrawer({ isOpen, onClose, assignment }) {
  const { data: course, isLoading } = useCourseDetails(assignment?.courseCode);

  if (!isOpen || !assignment) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <span className={styles.code}>{assignment.courseCode}</span>
            <h2 className={styles.name}>{assignment.courseName}</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Status & Units banner */}
          <div className={styles.metaBanner}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <StatusChip status={assignment.assignmentStatus || 'ASSIGNED'} />
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Units</span>
              <span className={styles.metaValue}>{assignment.units} Units</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Section</span>
              <span className={styles.metaValue}>{assignment.section}</span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <BookOpen size={16} /> Course Description
            </h3>
            <p className={styles.description}>
              {isLoading
                ? 'Loading course description...'
                : course?.description || 'No specific course description available.'}
            </p>
          </div>

          {/* Academic Term */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Calendar size={16} /> Academic Period
            </h3>
            <div className={styles.gridDetails}>
              <div>
                <span className={styles.label}>Semester:</span>
                <span className={styles.val}>{assignment.semester}</span>
              </div>
              <div>
                <span className={styles.label}>Academic Year:</span>
                <span className={styles.val}>{assignment.academicYear}</span>
              </div>
              <div>
                <span className={styles.label}>Assigned Date:</span>
                <span className={styles.val}>{formatDate(assignment.assignedAt)}</span>
              </div>
              <div>
                <span className={styles.label}>Department:</span>
                <span className={styles.val}>{course?.department || 'Information Technology'}</span>
              </div>
            </div>
          </div>

          {/* Assignment Identifiers */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Layers size={16} /> Assignment Details
            </h3>
            <div className={styles.idBox}>
              <div>
                <span className={styles.subText}>Assignment ID</span>
                <code className={styles.codeText}>{assignment.assignmentId}</code>
              </div>
              <div>
                <span className={styles.subText}>Faculty ID</span>
                <code className={styles.codeText}>{assignment.facultyId}</code>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="outline" fullWidth onClick={onClose}>
            Close Drawer
          </Button>
        </div>
      </div>
    </div>
  );
}
