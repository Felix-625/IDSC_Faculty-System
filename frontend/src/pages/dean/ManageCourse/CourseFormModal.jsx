import { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import styles from './CourseFormModal.module.css';

const DEPARTMENT_OPTIONS = [
  { value: 'Information Technology', label: 'College of Information Technology' },
  { value: 'Business Administration', label: 'College of Business Administration' },
  { value: 'Hospitality and Tourism Management', label: 'College of Hospitality & Tourism Management' },
  { value: 'Teacher Education', label: 'College of Teacher Education' },
  { value: 'Criminology', label: 'College of Criminology' },
  { value: 'General Education', label: 'Department of General Education' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

export function CourseFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isLoading,
  deanDepartment,
  isAvp = false,
}) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState(() => ({
    programCode: initialData?.programCode || '',
    programName: initialData?.programName || '',
    department: initialData?.department || deanDepartment || 'Information Technology',
    status: initialData?.status || 'ACTIVE',
  }));

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.programCode.trim()) {
      errs.programCode = 'Course/Program code is required (e.g. BSIT)';
    }
    if (!formData.programName.trim()) {
      errs.programName = 'Course/Program name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      programCode: formData.programCode.toUpperCase().trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Academic Program / Course' : 'Add Academic Program / Course'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.demoBanner}>
          <strong>Demo Data:</strong> Changes made here update the mock store in session memory.
        </div>

        <FormField
          label="Program / Course Code"
          required
          error={errors.programCode}
          hint={isEdit ? 'Program code cannot be changed once created.' : 'e.g. BSIT, BSCS, BLIS'}
        >
          <input
            type="text"
            className={styles.input}
            value={formData.programCode}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, programCode: e.target.value.toUpperCase() }))
            }
            disabled={isEdit || isLoading}
            placeholder="e.g. BSIT"
          />
        </FormField>

        <FormField
          label="Program / Degree Name"
          required
          error={errors.programName}
          hint="Full formal degree or certificate title"
        >
          <input
            type="text"
            className={styles.input}
            value={formData.programName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, programName: e.target.value }))
            }
            disabled={isLoading}
            placeholder="e.g. Bachelor of Science in Information Technology"
          />
        </FormField>

        <div className={styles.row}>
          <FormField
            label="Department"
            required
            hint={!isAvp && deanDepartment ? `Scoped to your college department (${deanDepartment})` : undefined}
          >
            <Select
              value={formData.department}
              onChange={(val) => setFormData((prev) => ({ ...prev, department: val }))}
              options={DEPARTMENT_OPTIONS}
              disabled={(!isAvp && Boolean(deanDepartment)) || isLoading}
            />
          </FormField>

          <FormField label="Status" required>
            <Select
              value={formData.status}
              onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
              options={STATUS_OPTIONS}
              disabled={isLoading}
            />
          </FormField>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Program'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
