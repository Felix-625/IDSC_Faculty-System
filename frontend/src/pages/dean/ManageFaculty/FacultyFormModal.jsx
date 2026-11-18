import { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import styles from './FacultyFormModal.module.css';
import { AlertCircle, UserCheck } from 'lucide-react';

export function FacultyFormModal({
  isOpen,
  onClose,
  onSubmit, // async (data) => void
  initialData = null, // if present -> edit mode
}) {
  const isEdit = Boolean(initialData);

  const [facultyId, setFacultyId] = useState(() => initialData?.facultyId || '');
  const [name, setName] = useState(() => initialData?.name || '');
  const [email, setEmail] = useState(() => initialData?.email || '');
  const [department, setDepartment] = useState(() => initialData?.department || 'Information Technology');
  const [position, setPosition] = useState(() => initialData?.position || 'FACULTY');
  const [employmentType, setEmploymentType] = useState(() => initialData?.employmentType || 'FULL_TIME');
  const [specialization, setSpecialization] = useState(() => initialData?.specialization || '');
  const [employmentStatus, setEmploymentStatus] = useState(() => initialData?.employmentStatus || 'ACTIVE');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facultyId.trim() || !name.trim() || !department.trim()) {
      setErrorMessage('Faculty ID, Name, and Department are required.');
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Please provide a valid email address.');
        return;
      }
    }

    setErrorMessage(null);
    setIsLoading(true);

    const payload = {
      facultyId: facultyId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim() || undefined,
      department: department.trim(),
      position,
      employmentType,
      specialization: specialization.trim() || undefined,
      employmentStatus,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.detail || 'Failed to save faculty record.');
    } finally {
      setIsLoading(false);
    }
  };

  const positionOptions = [
    { value: 'FACULTY', label: 'FACULTY' },
    { value: 'PROGRAM_HEAD', label: 'PROGRAM HEAD' },
    { value: 'DEAN', label: 'DEAN' },
  ];

  const employmentTypeOptions = [
    { value: 'FULL_TIME', label: 'FULL TIME' },
    { value: 'PART_TIME', label: 'PART TIME' },
    { value: 'OTHER', label: 'OTHER' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'INACTIVE', label: 'INACTIVE' },
    { value: 'RESIGNED', label: 'RESIGNED' },
    { value: 'ON_LEAVE', label: 'ON LEAVE' },
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
      title={isEdit ? 'Edit Faculty' : 'Add New Faculty'}
      subtitle={isEdit ? `Update profile for ${initialData?.facultyId}` : 'Register a new instructor or administrative member'}
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
            icon={UserCheck}
          >
            {isEdit ? 'Save Changes' : 'Register Faculty'}
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
          <FormField label="Faculty ID" id="facultyId" required>
            <input
              id="facultyId"
              type="text"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              placeholder="e.g. FAC-2026-003"
              disabled={isEdit || isLoading}
              className={styles.upperInput}
            />
          </FormField>

          <FormField label="Full Name" id="facultyName" required>
            <input
              id="facultyName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              disabled={isLoading}
            />
          </FormField>
        </div>

        <div className={styles.row}>
          <FormField label="Email Address" id="email">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. e.rostova@university.edu"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Department" id="department" required>
            <Select
              id="department"
              value={department}
              onChange={setDepartment}
              options={departmentOptions}
              disabled={isLoading}
            />
          </FormField>
        </div>

        <div className={styles.row}>
          <FormField label="Position" id="position" required>
            <Select
              id="position"
              value={position}
              onChange={setPosition}
              options={positionOptions}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Employment Type" id="employmentType" required>
            <Select
              id="employmentType"
              value={employmentType}
              onChange={setEmploymentType}
              options={employmentTypeOptions}
              disabled={isLoading}
            />
          </FormField>
        </div>

        <div className={styles.row}>
          <FormField label="Specialization" id="specialization">
            <input
              id="specialization"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. AI & Machine Learning"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Status" id="employmentStatus" required>
            <Select
              id="employmentStatus"
              value={employmentStatus}
              onChange={setEmploymentStatus}
              options={statusOptions}
              disabled={isLoading}
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
