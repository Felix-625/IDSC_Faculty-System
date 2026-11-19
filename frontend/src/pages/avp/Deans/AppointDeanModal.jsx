import { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import styles from './AppointDeanModal.module.css';

const DEPARTMENT_OPTIONS = [
  { value: 'Information Technology', label: 'College of Information Technology' },
  { value: 'Business Administration', label: 'College of Business Administration' },
  { value: 'Hospitality and Tourism Management', label: 'College of Hospitality & Tourism Management' },
  { value: 'Teacher Education', label: 'College of Teacher Education' },
  { value: 'Criminology', label: 'College of Criminology' },
  { value: 'General Education', label: 'Department of General Education (Minors)' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full-Time Dean' },
  { value: 'PART_TIME', label: 'Part-Time Dean' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'ON_LEAVE', label: 'ON_LEAVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

export function AppointDeanModal({ isOpen, onClose, initialData, onSubmit, isLoading }) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState(() => ({
    facultyId: initialData?.facultyId || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    department: initialData?.department || 'Information Technology',
    position: 'DEAN',
    employmentType: initialData?.employmentType || 'FULL_TIME',
    employmentStatus: initialData?.employmentStatus || 'ACTIVE',
    specialization: initialData?.specialization || '',
  }));

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.facultyId.trim()) {
      errs.facultyId = 'Dean ID is required (e.g. FAC-2026-010)';
    }
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid university email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      facultyId: formData.facultyId.trim(),
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      specialization: formData.specialization.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Update Dean Appointment: ${initialData?.name}` : 'Appoint College Dean'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.notice}>
          <strong>Academic Council Appointment:</strong> Appointed Deans have full administrative loading, scheduling, and grade authorization for their designated department.
        </div>

        <FormField
          label="Faculty / Dean ID"
          required
          error={errors.facultyId}
          hint={isEdit ? 'Dean ID is permanent' : 'e.g. FAC-2026-010'}
        >
          <input
            type="text"
            className={styles.input}
            value={formData.facultyId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, facultyId: e.target.value.toUpperCase() }))
            }
            disabled={isEdit || isLoading}
            placeholder="e.g. FAC-2026-010"
          />
        </FormField>

        <FormField label="Full Name with Title" required error={errors.name}>
          <input
            type="text"
            className={styles.input}
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            disabled={isLoading}
            placeholder="e.g. Dr. Maria Dela Cruz, Ph.D."
          />
        </FormField>

        <div className={styles.row}>
          <FormField label="College / Department Assignment" required>
            <Select
              value={formData.department}
              onChange={(val) => setFormData((prev) => ({ ...prev, department: val }))}
              options={DEPARTMENT_OPTIONS}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Employment Classification" required>
            <Select
              value={formData.employmentType}
              onChange={(val) => setFormData((prev) => ({ ...prev, employmentType: val }))}
              options={EMPLOYMENT_TYPE_OPTIONS}
              disabled={isLoading}
            />
          </FormField>
        </div>

        <div className={styles.row}>
          <FormField label="University Email" error={errors.email}>
            <input
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={isLoading}
              placeholder="e.g. dean.it@university.edu"
            />
          </FormField>

          <FormField label="Appointment Status" required>
            <Select
              value={formData.employmentStatus}
              onChange={(val) => setFormData((prev) => ({ ...prev, employmentStatus: val }))}
              options={STATUS_OPTIONS}
              disabled={isLoading}
            />
          </FormField>
        </div>

        <FormField label="Academic Specialization">
          <input
            type="text"
            className={styles.input}
            value={formData.specialization}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, specialization: e.target.value }))
            }
            disabled={isLoading}
            placeholder="e.g. Software Engineering & Systems Architecture"
          />
        </FormField>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {isEdit ? 'Save Appointment Changes' : 'Confirm Dean Appointment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
