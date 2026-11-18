import { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import { CURRENT_TERM } from '../../../config/academicTerm';
import styles from './SubjectFormModal.module.css';
import { AlertCircle, BookOpen } from 'lucide-react';

export function SubjectFormModal({
  isOpen,
  onClose,
  onSubmit, // async (data) => void
  initialData = null, // if provided -> edit mode
}) {
  const isEdit = Boolean(initialData);

  const [courseCode, setCourseCode] = useState(() => initialData?.courseCode || '');
  const [courseName, setCourseName] = useState(() => initialData?.courseName || '');
  const [description, setDescription] = useState(() => initialData?.description || '');
  const [units, setUnits] = useState(() => String(initialData?.units || '3'));
  const [department, setDepartment] = useState(
    () => initialData?.department || 'Information Technology'
  );
  const [semester, setSemester] = useState(
    () => initialData?.semester || CURRENT_TERM.semester
  );
  const [academicYear, setAcademicYear] = useState(
    () => initialData?.academicYear || CURRENT_TERM.academicYear
  );
  const [status, setStatus] = useState(() => initialData?.status || 'ACTIVE');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      setErrorMessage('Subject code and subject name are required.');
      return;
    }

    const unitsNum = parseInt(units, 10);
    if (isNaN(unitsNum) || unitsNum <= 0) {
      setErrorMessage('Units must be a positive integer (e.g. 3).');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const payload = {
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      description: description.trim(),
      units: unitsNum,
      department: department.trim(),
      semester: semester.trim(),
      academicYear: academicYear.trim(),
      status,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.detail || 'Failed to save subject.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'INACTIVE', label: 'INACTIVE' },
  ];

  const departmentOptions = [
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Information Studies', label: 'Information Studies' },
    { value: 'General Education', label: 'General Education' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Subject' : 'Add New Subject'}
      subtitle={
        isEdit
          ? `Update details for ${initialData?.courseCode}`
          : 'Create a curriculum subject offering'
      }
      maxWidth="560px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            icon={BookOpen}
          >
            {isEdit ? 'Save Changes' : 'Create Subject'}
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

        <div className={styles.row}>
          <FormField label="Subject Code" id="courseCode" required>
            <input
              id="courseCode"
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. IT305"
              disabled={isEdit || isLoading}
              className={styles.upperInput}
            />
          </FormField>

          <FormField label="Units" id="units" required>
            <input
              id="units"
              type="number"
              min="1"
              max="10"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              disabled={isLoading}
            />
          </FormField>
        </div>

        <FormField label="Subject Name" id="courseName" required>
          <input
            id="courseName"
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="e.g. Mobile Application Development"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Department / Course" id="department" required>
          <Select
            id="department"
            value={department}
            onChange={setDepartment}
            options={departmentOptions}
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Description" id="description">
          <textarea
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of course objectives and scope..."
            disabled={isLoading}
            className={styles.textarea}
          />
        </FormField>

        <div className={styles.row}>
          <FormField label="Semester" id="semester">
            <input
              id="semester"
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Academic Year" id="academicYear">
            <input
              id="academicYear"
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2026-2027"
              disabled={isLoading}
            />
          </FormField>
        </div>

        <FormField label="Status" id="status" required>
          <Select
            id="status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
            disabled={isLoading}
          />
        </FormField>
      </form>
    </Modal>
  );
}
