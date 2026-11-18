import { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import { ALLOWED_GRADES } from '../../../api/grades';
import { formatGrade } from '../../../utils/format';
import styles from './GradeModal.module.css';
import { AlertCircle, Award } from 'lucide-react';

export function EditGradeModal({
  isOpen,
  onClose,
  onSubmit, // async (studentId, grade) => boolean
  assignment,
  student,
  currentGrade,
}) {
  const [selectedGrade, setSelectedGrade] = useState(() =>
    currentGrade !== undefined && currentGrade !== null ? String(currentGrade) : '1.0'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const gradeOptions = ALLOWED_GRADES.map((g) => ({
    value: String(g),
    label: `${formatGrade(g)} ${g === 5.0 ? '(Failed)' : g <= 1.5 ? '(Excellent)' : ''}`,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student?.studentId) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await onSubmit(student.studentId, parseFloat(selectedGrade));
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
      title="Edit Grade"
      subtitle={`${assignment?.courseCode} · Section ${assignment?.section}`}
      maxWidth="480px"
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
            Update Grade
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

        {/* Student Read-Only Card */}
        <div className={styles.studentInfoCard}>
          <span className={styles.infoLabel}>Student</span>
          <div className={styles.studentName}>{student?.name}</div>
          <div className={styles.studentMeta}>
            Student ID: <code>{student?.studentId}</code> · Current Grade:{' '}
            <strong>{formatGrade(currentGrade)}</strong>
          </div>
        </div>

        {/* Grade Selection */}
        <FormField
          label="Updated Final Grade"
          id="editGradeSelect"
          required
          helpText="Official Philippine collegiate grading scale (1.00 to 5.00)"
        >
          <Select
            id="editGradeSelect"
            value={selectedGrade}
            onChange={setSelectedGrade}
            options={gradeOptions}
            disabled={isLoading}
          />
        </FormField>
      </form>
    </Modal>
  );
}
