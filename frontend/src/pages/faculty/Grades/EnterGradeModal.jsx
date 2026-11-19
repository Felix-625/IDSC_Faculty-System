import { useState, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import styles from './GradeModal.module.css';
import { AlertCircle, Award } from 'lucide-react';

const GRADE_SELECT_OPTIONS = [
  { value: '', label: '— None / Pending —' },
  { value: '1.0', label: '1.00 (Excellent)' },
  { value: '1.25', label: '1.25 (Very Good)' },
  { value: '1.5', label: '1.50 (Very Good)' },
  { value: '1.75', label: '1.75 (Good)' },
  { value: '2.0', label: '2.00 (Good)' },
  { value: '2.25', label: '2.25 (Fair)' },
  { value: '2.5', label: '2.50 (Fair)' },
  { value: '2.75', label: '2.75 (Passing)' },
  { value: '3.0', label: '3.00 (Passing)' },
  { value: '5.0', label: '5.00 (Failed)' },
  { value: 'INC', label: 'INC (Incomplete)' },
  { value: 'DRP', label: 'DRP (Dropped)' },
  { value: 'W', label: 'W (Withdrawn)' },
];

const PERIOD_SELECT_OPTIONS = [
  { value: '', label: '— None / Not Graded —' },
  { value: '1.0', label: '1.00 (Excellent)' },
  { value: '1.25', label: '1.25 (Very Good)' },
  { value: '1.5', label: '1.50 (Very Good)' },
  { value: '1.75', label: '1.75 (Good)' },
  { value: '2.0', label: '2.00 (Good)' },
  { value: '2.25', label: '2.25 (Fair)' },
  { value: '2.5', label: '2.50 (Fair)' },
  { value: '2.75', label: '2.75 (Passing)' },
  { value: '3.0', label: '3.00 (Passing)' },
  { value: '5.0', label: '5.00 (Failed)' },
  { value: 'INC', label: 'INC (Incomplete)' },
  { value: 'DRP', label: 'DRP (Dropped)' },
  { value: 'W', label: 'W (Withdrawn)' },
];

function deriveRemarks(val) {
  if (!val) return 'PENDING';
  if (val === 'INC') return 'INCOMPLETE';
  if (val === 'DRP') return 'DROPPED';
  if (val === 'W') return 'WITHDRAWN';
  const num = parseFloat(val);
  if (!isNaN(num)) {
    return num <= 3.0 ? 'PASSED' : 'FAILED';
  }
  return 'PENDING';
}

export function EnterGradeModal({
  isOpen,
  onClose,
  onSubmit, // async (studentId, gradePayload) => boolean
  assignment,
  student, // optional preselected student
  pendingStudents = [], // list of students with no grade yet
  onSwitchToEdit,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(() =>
    student?.studentId || (pendingStudents[0]?.studentId || '')
  );

  // Period Grades
  const [prelim, setPrelim] = useState('');
  const [midterm, setMidterm] = useState('');
  const [preFinal, setPreFinal] = useState('');
  const [finalGrade, setFinalGrade] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const activeStudent = student || pendingStudents.find((s) => s.studentId === selectedStudentId);

  const studentOptions = pendingStudents.map((s) => ({
    value: s.studentId,
    label: `${s.name} (${s.studentId})`,
  }));

  const remarks = useMemo(() => deriveRemarks(finalGrade), [finalGrade]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMessage('Please select a student.');
      return;
    }

    if (!prelim && !midterm && !preFinal && !finalGrade) {
      setErrorMessage(
        'Please provide at least one period grade (Prelim, Midterm, Pre-Final) or Final Grade.'
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload = {
        grade: finalGrade || undefined,
        components: {
          prelim: prelim || undefined,
          midterm: midterm || undefined,
          preFinal: preFinal || undefined,
          final: finalGrade || undefined,
        },
        remarks,
      };

      await onSubmit(selectedStudentId, payload);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setErrorMessage(
          'A grade has already been submitted for this student. Switching to edit mode...'
        );
        setTimeout(() => {
          if (onSwitchToEdit && activeStudent) {
            onSwitchToEdit(activeStudent);
          }
        }, 1200);
      } else {
        setErrorMessage(err.detail || 'Failed to submit grade.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enter Student Grades"
      subtitle={`${assignment?.courseCode} · Section ${assignment?.section}`}
      maxWidth="540px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!selectedStudentId}
            icon={Award}
          >
            Save Grades
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {errorMessage && (
          <div className={styles.alertError} role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {student ? (
          <div className={styles.studentInfoCard}>
            <span className={styles.infoLabel}>Selected Student</span>
            <span className={styles.studentName}>{student.name}</span>
            <span className={styles.studentMeta}>
              ID: <code>{student.studentId}</code> • {assignment?.section}
            </span>
          </div>
        ) : pendingStudents.length > 0 ? (
          <FormField label="Select Student" id="studentSelect" required>
            <Select
              id="studentSelect"
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              options={studentOptions}
            />
          </FormField>
        ) : (
          <div className={styles.noPendingNotice}>
            All students in this offering currently have recorded grades.
          </div>
        )}

        {/* Period Grading Section: Prelim, Midterm, Pre-Final */}
        <div className={styles.periodsBox}>
          <span className={styles.boxTitle}>Period Grading Breakdown (Optional)</span>
          <div className={styles.periodRow}>
            <FormField label="Prelim" id="prelimGrade">
              <Select
                id="prelimGrade"
                value={prelim}
                onChange={setPrelim}
                options={PERIOD_SELECT_OPTIONS}
              />
            </FormField>

            <FormField label="Midterm" id="midtermGrade">
              <Select
                id="midtermGrade"
                value={midterm}
                onChange={setMidterm}
                options={PERIOD_SELECT_OPTIONS}
              />
            </FormField>

            <FormField label="Pre-Final" id="preFinalGrade">
              <Select
                id="preFinalGrade"
                value={preFinal}
                onChange={setPreFinal}
                options={PERIOD_SELECT_OPTIONS}
              />
            </FormField>
          </div>
        </div>

        {/* Final Official Grade & Auto Remarks */}
        <div className={styles.finalBox}>
          <FormField
            label="Final Official Grade (Optional if period grade entered)"
            id="finalGrade"
            hint="Supports numeric scale (1.00–5.00) plus non-numeric marks (INC, DRP, W)"
          >
            <Select
              id="finalGrade"
              value={finalGrade}
              onChange={setFinalGrade}
              options={GRADE_SELECT_OPTIONS}
            />
          </FormField>

          <div className={styles.remarksRow}>
            <span className={styles.remarksLabel}>Evaluated Status:</span>
            <span
              className={`${styles.remarksBadge} ${
                remarks === 'PASSED'
                  ? styles.badgePassed
                  : remarks === 'FAILED'
                  ? styles.badgeFailed
                  : styles.badgeWarning
              }`}
            >
              {remarks}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
