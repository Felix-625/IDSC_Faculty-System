import { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import { ALLOWED_GRADES } from '../../../api/grades';
import { formatGrade } from '../../../utils/format';
import styles from './GradeModal.module.css';
import { AlertCircle, Award } from 'lucide-react';

export function EnterGradeModal({
  isOpen,
  onClose,
  onSubmit, // async (studentId, grade) => boolean
  assignment,
  student, // optional preselected student
  pendingStudents = [], // list of students with no grade yet
  onSwitchToEdit,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(() =>
    student?.studentId || (pendingStudents[0]?.studentId || '')
  );
  const [selectedGrade, setSelectedGrade] = useState('1.0');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const activeStudent = student || pendingStudents.find((s) => s.studentId === selectedStudentId);

  const gradeOptions = ALLOWED_GRADES.map((g) => ({
    value: String(g),
    label: `${formatGrade(g)} ${g === 5.0 ? '(Failed)' : g <= 1.5 ? '(Excellent)' : ''}`,
  }));

  const studentOptions = pendingStudents.map((s) => ({
    value: s.studentId,
    label: `${s.name} (${s.studentId})`,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMessage('Please select a student.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await onSubmit(selectedStudentId, parseFloat(selectedGrade));
      onClose();
    } catch (err) {
      if (err.status === 409) {
        // Business conflict: grade already posted
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
      title="Enter Final Grade"
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
            disabled={!selectedStudentId}
            icon={Award}
          >
            Save Grade
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

        {/* Student Selection or Read-Only Card */}
        {student ? (
          <div className={styles.studentInfoCard}>
            <span className={styles.infoLabel}>Student</span>
            <div className={styles.studentName}>{student.name}</div>
            <div className={styles.studentMeta}>
              Student ID: <code>{student.studentId}</code> · {student.section || assignment?.section}
            </div>
          </div>
        ) : (
          <FormField label="Select Student" id="studentSelect" required>
            {pendingStudents.length === 0 ? (
              <div className={styles.noPendingNotice}>
                All enrolled students already have grades posted.
              </div>
            ) : (
              <Select
                id="studentSelect"
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                options={studentOptions}
                placeholder="Choose pending student"
                disabled={isLoading}
              />
            )}
          </FormField>
        )}

        {/* Grade Selection */}
        <FormField
          label="Final Academic Grade"
          id="gradeSelect"
          required
          helpText="Official Philippine collegiate grading scale (1.00 to 5.00)"
        >
          <Select
            id="gradeSelect"
            value={selectedGrade}
            onChange={setSelectedGrade}
            options={gradeOptions}
            disabled={isLoading || !selectedStudentId}
          />
        </FormField>
      </form>
    </Modal>
  );
}
