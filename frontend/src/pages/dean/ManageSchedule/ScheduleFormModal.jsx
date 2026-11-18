import { useState, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { FormField } from '../../../components/common/FormField';
import { Select } from '../../../components/common/Select';
import styles from './ScheduleFormModal.module.css';
import { Calendar, AlertCircle } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function ScheduleFormModal({
  isOpen,
  onClose,
  onSubmit, // async (data) => void
  facultyList = [],
  initialData = null, // edit mode if present
  roomSuggestions = [],
}) {
  const isEdit = Boolean(initialData);

  const [selectedFacultyId, setSelectedFacultyId] = useState(
    () => initialData?.facultyId || (facultyList[0]?.facultyId || '')
  );

  // Active selected faculty object
  const activeFaculty = useMemo(() => {
    return facultyList.find((f) => f.facultyId === selectedFacultyId);
  }, [facultyList, selectedFacultyId]);

  // Assigned subjects for the chosen faculty
  const assignedSubjects = useMemo(() => {
    return activeFaculty?.assignedSubjects || [];
  }, [activeFaculty]);

  const [selectedCourseCode, setSelectedCourseCode] = useState(
    () => initialData?.courseCode || (assignedSubjects[0]?.courseCode || '')
  );

  const [section, setSection] = useState(
    () => initialData?.section || (assignedSubjects[0]?.section || 'BSIT-3A')
  );

  const [day, setDay] = useState(() => initialData?.day || 'Monday');
  const [startTime, setStartTime] = useState(() => initialData?.startTime || '07:00');
  const [endTime, setEndTime] = useState(() => initialData?.endTime || '10:00');
  const [room, setRoom] = useState(() => initialData?.room || 'ICT-204');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // When faculty changes, update subject and section options
  const handleFacultyChange = (fId) => {
    setSelectedFacultyId(fId);
    const targetFaculty = facultyList.find((f) => f.facultyId === fId);
    const subjects = targetFaculty?.assignedSubjects || [];
    if (subjects.length > 0) {
      setSelectedCourseCode(subjects[0].courseCode);
      setSection(subjects[0].section);
    } else {
      setSelectedCourseCode('');
      setSection('');
    }
  };

  const handleSubjectChange = (cCode) => {
    setSelectedCourseCode(cCode);
    const found = assignedSubjects.find((s) => s.courseCode === cCode);
    if (found) {
      setSection(found.section);
    }
  };

  const facultyOptions = facultyList.map((f) => ({
    value: f.facultyId,
    label: `${f.name} (${f.facultyId})`,
  }));

  const subjectOptions = assignedSubjects.map((s) => ({
    value: s.courseCode,
    label: `${s.courseCode} — ${s.courseName} (${s.section})`,
  }));

  const dayOptions = DAYS_OF_WEEK.map((d) => ({ value: d, label: d }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacultyId) {
      setErrorMessage('Please select a faculty member.');
      return;
    }
    if (!selectedCourseCode) {
      setErrorMessage(
        'Selected faculty has no assigned subjects. Assign subjects to this faculty first.'
      );
      return;
    }
    if (!section.trim()) {
      setErrorMessage('Section is required.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('Start time and end time are required.');
      return;
    }
    if (startTime >= endTime) {
      setErrorMessage('End time must be later than start time.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const payload = {
      facultyId: selectedFacultyId,
      courseCode: selectedCourseCode,
      section: section.trim(),
      day,
      startTime,
      endTime,
      room: room.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.detail || 'Failed to save class schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Class Schedule' : 'Add Class Schedule'}
      subtitle={
        isEdit
          ? `Modify schedule ${initialData?.scheduleId}`
          : 'Schedule a teaching period for an assigned subject'
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
            disabled={!selectedCourseCode}
            icon={Calendar}
          >
            {isEdit ? 'Save Changes' : 'Create Schedule'}
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

        {/* Faculty Select */}
        <FormField label="Faculty Member" id="facultySelect" required>
          <Select
            id="facultySelect"
            value={selectedFacultyId}
            onChange={handleFacultyChange}
            options={facultyOptions}
            disabled={isEdit || isLoading}
          />
        </FormField>

        {/* Subject Select (Limited to faculty's assigned subjects) */}
        <FormField
          label="Assigned Subject"
          id="courseSelect"
          required
          helpText={
            assignedSubjects.length === 0
              ? 'This faculty has no assigned subjects yet. Please assign a subject first.'
              : undefined
          }
        >
          {assignedSubjects.length === 0 ? (
            <div className={styles.noAssignedBox}>
              No assigned subjects found for this faculty member.
            </div>
          ) : (
            <Select
              id="courseSelect"
              value={selectedCourseCode}
              onChange={handleSubjectChange}
              options={subjectOptions}
              disabled={isEdit || isLoading}
            />
          )}
        </FormField>

        {/* Section (Auto-filled) */}
        <FormField label="Section" id="sectionInput" required>
          <input
            id="sectionInput"
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. BSIT-3A"
          />
        </FormField>

        <div className={styles.row}>
          <FormField label="Day of Week" id="daySelect" required>
            <Select
              id="daySelect"
              value={day}
              onChange={setDay}
              options={dayOptions}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Classroom / Room" id="roomInput">
            <input
              id="roomInput"
              type="text"
              list="schedule-rooms-list"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. ICT-204"
              disabled={isLoading}
            />
            <datalist id="schedule-rooms-list">
              {roomSuggestions.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </FormField>
        </div>

        <div className={styles.row}>
          <FormField label="Start Time (24h)" id="startTime" required>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="End Time (24h)" id="endTime" required>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isLoading}
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
