import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../../../api/schedules';
import { getFacultyList } from '../../../api/faculty';
import { getCourses } from '../../../api/courses';
import { useToast } from '../../../components/common/useToast';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScheduleFormModal } from './ScheduleFormModal';
import { formatTimeRange } from '../../../utils/format';
import styles from './ManageSchedulePage.module.css';
import { Calendar, Plus, Edit2, Trash2, Clock, MapPin } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function ManageSchedulePage() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch schedules with optional server filters (day, section)
  const {
    data: schedules = [],
    isLoading: isLoadingSchedules,
    isError: isSchedulesError,
    refetch,
  } = useQuery({
    queryKey: ['schedules', { day: selectedDay, section: selectedSection }],
    queryFn: () =>
      getSchedules({
        day: selectedDay !== 'ALL' ? selectedDay : undefined,
        section: selectedSection !== 'ALL' ? selectedSection : undefined,
      }),
  });

  // 2. Fetch faculty list to join faculty names
  const { data: facultyList = [], isLoading: isLoadingFaculty } = useQuery({
    queryKey: ['faculty'],
    queryFn: getFacultyList,
  });

  // 3. Fetch courses for filter options
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);

  // Distinct filter options
  const dayOptions = [
    { value: 'ALL', label: 'Day: All' },
    ...DAYS_OF_WEEK.map((d) => ({ value: d, label: d })),
  ];

  const courseOptions = [
    { value: 'ALL', label: 'Course: All' },
    ...courses.map((c) => ({ value: c.courseCode, label: `${c.courseCode} — ${c.courseName}` })),
  ];

  const sectionOptions = useMemo(() => {
    const secs = Array.from(new Set(schedules.map((s) => s.section).filter(Boolean)));
    return [
      { value: 'ALL', label: 'Section: All' },
      ...secs.map((s) => ({ value: s, label: s })),
    ];
  }, [schedules]);

  const roomSuggestions = useMemo(() => {
    return Array.from(new Set(schedules.map((s) => s.room).filter(Boolean)));
  }, [schedules]);

  // Client-side filtering
  const filteredSchedules = useMemo(() => {
    return schedules
      .map((s) => {
        const fac = facultyList.find((f) => f.facultyId === s.facultyId);
        return {
          ...s,
          facultyName: fac?.name || s.facultyId,
        };
      })
      .filter((item) => {
        const matchesCourse =
          selectedCourse === 'ALL' || item.courseCode === selectedCourse;

        const matchesSearch =
          searchQuery === '' ||
          item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.room && item.room.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCourse && matchesSearch;
      });
  }, [schedules, facultyList, selectedCourse, searchQuery]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createSchedule(data),
    onSuccess: (res) => {
      toastSuccess('Schedule added', `Schedule ${res.scheduleId} created.`);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (err) => {
      toastError('Failed to create schedule', err.detail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ scheduleId, data }) => updateSchedule(scheduleId, data),
    onSuccess: (res) => {
      toastSuccess('Schedule updated', `Schedule ${res.scheduleId} saved.`);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (err) => {
      toastError('Failed to update schedule', err.detail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (scheduleId) => deleteSchedule(scheduleId),
    onSuccess: (_, scheduleId) => {
      toastSuccess('Schedule deleted', `Schedule ${scheduleId} removed.`);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setDeletingSchedule(null);
    },
    onError: (err) => {
      toastError('Failed to delete schedule', err.detail);
      setDeletingSchedule(null);
    },
  });

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsFormModalOpen(true);
  };

  const columns = [
    {
      key: 'scheduleId',
      header: 'Schedule ID',
      width: '130px',
      render: (row) => <code className={styles.idCode}>{row.scheduleId}</code>,
    },
    {
      key: 'courseCode',
      header: 'Course',
      width: '120px',
      render: (row) => <span className={styles.courseCodeBadge}>{row.courseCode}</span>,
    },
    {
      key: 'section',
      header: 'Section',
      width: '120px',
      render: (row) => <span className={styles.sectionBadge}>{row.section}</span>,
    },
    {
      key: 'facultyName',
      header: 'Faculty',
      render: (row) => (
        <div className={styles.facultyCell}>
          <span className={styles.facultyName}>{row.facultyName}</span>
          <span className={styles.facultyIdText}>{row.facultyId}</span>
        </div>
      ),
    },
    {
      key: 'day',
      header: 'Day',
      width: '120px',
      render: (row) => <span className={styles.dayText}>{row.day}</span>,
    },
    {
      key: 'time',
      header: 'Time',
      width: '180px',
      render: (row) => (
        <div className={styles.timeRow}>
          <Clock size={14} className={styles.timeIcon} />
          <span>{formatTimeRange(row.startTime, row.endTime)}</span>
        </div>
      ),
    },
    {
      key: 'room',
      header: 'Room',
      width: '120px',
      render: (row) => (
        <div className={styles.roomRow}>
          <MapPin size={14} className={styles.roomIcon} />
          <span>{row.room || 'TBA'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '110px',
      align: 'right',
      render: (row) => (
        <div className={styles.actionBtns}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => handleOpenEdit(row)}
            title="Edit Schedule"
            aria-label={`Edit ${row.scheduleId}`}
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => setDeletingSchedule(row)}
            title="Delete Schedule"
            aria-label={`Delete ${row.scheduleId}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="Manage Class Schedule"
        subtitle="CLASS SCHEDULE: Timetable, rooms, faculty distribution, and conflict management."
        icon={Calendar}
        actions={
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            + Add Schedule
          </Button>
        }
      />

      {/* Toolbar: Search, Day Filter, Course Filter, Section Filter */}
      <div className={styles.toolbar}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by course, section, faculty, room..."
          className={styles.search}
        />

        <div className={styles.filters}>
          <Select
            value={selectedDay}
            onChange={setSelectedDay}
            options={dayOptions}
            className={styles.selectDay}
          />
          <Select
            value={selectedCourse}
            onChange={setSelectedCourse}
            options={courseOptions}
            className={styles.selectCourse}
          />
          <Select
            value={selectedSection}
            onChange={setSelectedSection}
            options={sectionOptions}
            className={styles.selectSection}
          />
        </div>
      </div>

      {/* Table */}
      {isSchedulesError ? (
        <ErrorState
          title="Could not load schedules"
          message="Failed to retrieve schedule entries from the server."
          onRetry={refetch}
        />
      ) : (
        <div className={styles.tableCard}>
          <DataTable
            columns={columns}
            data={filteredSchedules}
            keyField="scheduleId"
            isLoading={isLoadingSchedules || isLoadingFaculty}
            emptyComponent={
              <EmptyState
                title="No schedules found"
                description={
                  searchQuery || selectedDay !== 'ALL'
                    ? 'No schedules match your filters.'
                    : 'No class schedules have been configured yet.'
                }
                icon={Calendar}
              />
            }
          />
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <ScheduleFormModal
        key={editingSchedule?.scheduleId || 'new'}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        facultyList={facultyList}
        roomSuggestions={roomSuggestions}
        initialData={editingSchedule}
        onSubmit={async (data) => {
          if (editingSchedule) {
            await updateMutation.mutateAsync({
              scheduleId: editingSchedule.scheduleId,
              data,
            });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingSchedule)}
        onClose={() => setDeletingSchedule(null)}
        title={`Delete Schedule: ${deletingSchedule?.scheduleId}`}
        message={`Are you sure you want to delete this schedule period for ${deletingSchedule?.courseCode} (${deletingSchedule?.section}) on ${deletingSchedule?.day}?`}
        confirmLabel="Delete Schedule"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingSchedule) {
            deleteMutation.mutate(deletingSchedule.scheduleId);
          }
        }}
      />
    </div>
  );
}
