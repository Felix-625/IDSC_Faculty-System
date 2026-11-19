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

const formatSelectValue = (val) => {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'number') {
    if (val === 1 || val === 2 || val === 3 || val === 5) return `${val}.0`;
    return String(val);
  }
  return String(val);
};

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

export function EditGradeModal({
  isOpen,
  onClose,
  onSubmit, // async (studentId, gradePayload) => boolean
  assignment,
  student,
  currentGrade,
  currentComponents,
}) {
  const [selectedGrade, setSelectedGrade] = useState(() => formatSelectValue(currentGrade));
  const [prelim, setPrelim] = useState(() => formatSelectValue(currentComponents?.prelim));
  const [midterm, setMidterm] = useState(() => formatSelectValue(currentComponents?.midterm));
  const [preFinal, setPreFinal] = useState(() => formatSelectValue(currentComponents?.preFinal));
  const [reason, setReason] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const remarks = useMemo(() => deriveRemarks(selectedGrade), [selectedGrade]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student?.studentId) return;

    if (!prelim && !midterm && !preFinal && !selectedGrade) {
      setErrorMessage(
        'Please provide at least one period grade (Prelim, Midterm, Pre-Final) or Final Grade.'
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload = {
        grade: selectedGrade || undefined,
        components: {
          prelim: prelim || undefined,
          midterm: midterm || undefined,
          preFinal: preFinal || undefined,
          final: selectedGrade || undefined,
        },
        remarks,
        reason: reason.trim() || undefined,
      };

      await onSubmit(student.studentId, payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.detail || 'Failed to update grade.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Student Grades"
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
            icon={Award}
          >
            Update Grades
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

        <div className={styles.studentInfoCard}>
          <span className={styles.infoLabel}>Student</span>
          <span className={styles.studentName}>{student?.name}</span>
          <span className={styles.studentMeta}>
            ID: <code>{student?.studentId}</code> • {assignment?.section}
          </span>
        </div>

        {/* Period Grades Breakdown */}
        <div className={styles.periodsBox}>
          <span className={styles.boxTitle}>Period Grading Breakdown</span>
          <div className={styles.periodRow}>
            <FormField label="Prelim" id="prelimGradeEdit">
              <Select
                id="prelimGradeEdit"
                value={prelim}
                onChange={setPrelim}
                options={PERIOD_SELECT_OPTIONS}
              />
            </FormField>

            <FormField label="Midterm" id="midtermGradeEdit">
              <Select
                id="midtermGradeEdit"
                value={midterm}
                onChange={setMidterm}
                options={PERIOD_SELECT_OPTIONS}
              />
            </FormField>

            <FormField label="Pre-Final" id="preFinalGradeEdit">
              <Select
                id="preFinalGradeEdit"
                value={preFinal}
                onChange={setPreFinal}
                options={PERIOD_SELECT_OPTIONS}
              />
            </FormField>
          </div>
        </div>

        {/* Final Official Grade */}
        <div className={styles.finalBox}>
          <FormField
            label="Final Official Grade (Optional if period grade entered)"
            id="gradeSelect"
            hint="Supports numeric grades (1.00–5.00) and marks (INC, DRP, W)"
          >
            <Select
              id="gradeSelect"
              value={selectedGrade}
              onChange={setSelectedGrade}
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

        <FormField label="Reason for Adjustment / Note (Optional)">
          <input
            type="text"
            className={styles.reasonInput}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Submitted missing project / Removal exam passed"
          />
        </FormField>
      </form>
    </Modal>
  );
}
