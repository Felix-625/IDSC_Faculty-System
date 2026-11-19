import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockPrograms } from '../../../api/mock/programs';
import { Modal } from '../../../components/common/Modal';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import styles from './SectionFormModal.module.css';

const YEAR_LEVEL_OPTIONS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
];

export function SectionFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isLoading,
  deanDepartment,
  isAvp = false,
}) {
  const isEdit = Boolean(initialData);

  const { data: programs = [] } = useQuery({
    queryKey: ['mockPrograms', deanDepartment, isAvp],
    queryFn: () => mockPrograms.list(isAvp ? undefined : deanDepartment),
  });

  const programOptions = programs.map((p) => ({
    value: p.programCode,
    label: `${p.programCode} - ${p.programName}`,
  }));

  const [formData, setFormData] = useState(() => ({
    sectionName: initialData?.sectionName || '',
    program: initialData?.program || (programOptions[0]?.value || 'BSIT'),
    yearLevel: String(initialData?.yearLevel || '1'),
    studentCount: String(initialData?.studentCount ?? 30),
  }));

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.sectionName.trim()) {
      errs.sectionName = 'Section name is required (e.g. BSIT-1A)';
    }
    if (!formData.program) {
      errs.program = 'Academic program is required';
    }
    const count = parseInt(formData.studentCount, 10);
    if (isNaN(count) || count < 0) {
      errs.studentCount = 'Student count must be a non-negative number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      sectionName: formData.sectionName.toUpperCase().trim(),
      program: formData.program,
      yearLevel: parseInt(formData.yearLevel, 10),
      studentCount: parseInt(formData.studentCount, 10) || 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Section: ${initialData?.sectionName}` : 'Add New Class Section'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.demoBanner}>
          <strong>Demo Data:</strong> Sections are stored in local mock state.
        </div>

        <FormField
          label="Section Name"
          required
          error={errors.sectionName}
          hint="e.g. BSIT-1A, BSCS-3B"
        >
          <input
            type="text"
            className={styles.input}
            value={formData.sectionName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sectionName: e.target.value.toUpperCase() }))
            }
            disabled={isLoading}
            placeholder="e.g. BSIT-1A"
          />
        </FormField>

        <FormField
          label="Degree Program"
          required
          error={errors.program}
        >
          <Select
            value={formData.program}
            onChange={(val) => setFormData((prev) => ({ ...prev, program: val }))}
            options={
              programOptions.length > 0
                ? programOptions
                : [{ value: 'BSIT', label: 'BSIT - Information Technology' }]
            }
            disabled={isLoading}
          />
        </FormField>

        <div className={styles.row}>
          <FormField label="Year Level" required>
            <Select
              value={formData.yearLevel}
              onChange={(val) => setFormData((prev) => ({ ...prev, yearLevel: val }))}
              options={YEAR_LEVEL_OPTIONS}
              disabled={isLoading}
            />
          </FormField>

          <FormField
            label="Enrolled Students"
            error={errors.studentCount}
            hint="Class roster size"
          >
            <input
              type="number"
              min="0"
              max="100"
              className={styles.input}
              value={formData.studentCount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, studentCount: e.target.value }))
              }
              disabled={isLoading}
            />
          </FormField>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Section'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
