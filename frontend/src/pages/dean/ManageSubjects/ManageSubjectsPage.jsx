import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../../api/courses';
import { useToast } from '../../../components/common/useToast';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Modal } from '../../../components/common/Modal';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { SubjectFormModal } from './SubjectFormModal';
import { formatGrade } from '../../../utils/format';
import styles from './ManageSubjectsPage.module.css';
import { BookOpen, Plus, Edit2, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

export function ManageSubjectsPage() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);

  // 409 Delete conflict state
  const [deleteConflict, setDeleteConflict] = useState(null); // { course, message }

  // Distinct departments
  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(courses.map((c) => c.department).filter(Boolean)));
    return [
      { value: 'ALL', label: 'Course: All' },
      ...depts.map((d) => ({ value: d, label: d })),
    ];
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.department && c.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = selectedDept === 'ALL' || c.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [courses, searchQuery, selectedDept]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createCourse(data),
    onSuccess: (res) => {
      toastSuccess('Subject created successfully', `${res.courseCode} added to catalog.`);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err) => {
      toastError('Failed to create subject', err.detail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ courseCode, data }) => updateCourse(courseCode, data),
    onSuccess: (res) => {
      toastSuccess('Subject updated', `${res.courseCode} details updated.`);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err) => {
      toastError('Failed to update subject', err.detail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (courseCode) => deleteCourse(courseCode),
    onSuccess: (_, courseCode) => {
      toastSuccess('Subject deleted', `${courseCode} removed.`);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDeletingCourse(null);
    },
    onError: (err, courseCode) => {
      if (err.status === 409) {
        // Course is assigned to faculty! Close delete confirm and open 409 conflict dialog
        const courseObj = courses.find((c) => c.courseCode === courseCode);
        setDeletingCourse(null);
        setDeleteConflict({
          course: courseObj,
          message:
            err.detail ||
            `Subject ${courseCode} is currently assigned to faculty. It cannot be permanently deleted.`,
        });
      } else {
        toastError('Failed to delete subject', err.detail);
        setDeletingCourse(null);
      }
    },
  });

  // Action: Mark as INACTIVE on 409 conflict
  const markInactiveMutation = useMutation({
    mutationFn: async (course) => {
      return updateCourse(course.courseCode, {
        ...course,
        status: 'INACTIVE',
      });
    },
    onSuccess: (res) => {
      toastSuccess('Subject marked as INACTIVE', `${res.courseCode} is now set to INACTIVE.`);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDeleteConflict(null);
    },
    onError: (err) => {
      toastError('Failed to update status', err.detail);
    },
  });

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setIsFormModalOpen(true);
  };

  const columns = [
    {
      key: 'courseCode',
      header: 'Subject Code',
      width: '140px',
      render: (row) => <span className={styles.codeBadge}>{row.courseCode}</span>,
    },
    {
      key: 'courseName',
      header: 'Subject Name',
      render: (row) => (
        <div className={styles.nameCell}>
          <span className={styles.subjectName}>{row.courseName}</span>
          {row.description && <span className={styles.descriptionText}>{row.description}</span>}
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Course / Department',
      width: '200px',
      render: (row) => (
        <span className={styles.deptBadge}>{row.department || 'Information Technology'}</span>
      ),
    },
    {
      key: 'units',
      header: 'Units',
      width: '90px',
      render: (row) => <span className={styles.unitsText}>{formatGrade(row.units)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (row) => <StatusChip status={row.status || 'ACTIVE'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '130px',
      align: 'right',
      render: (row) => (
        <div className={styles.actionBtns}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => handleOpenEdit(row)}
            title="Edit Subject"
            aria-label={`Edit ${row.courseCode}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => setDeletingCourse(row)}
            title="Delete Subject"
            aria-label={`Delete ${row.courseCode}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="Manage Subjects"
        subtitle="Configure university curriculum subjects, credit units, and active courses."
        icon={BookOpen}
        actions={
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            + Add Subject
          </Button>
        }
      />

      {/* Toolbar: Search and Department Filter */}
      <div className={styles.toolbar}>
        <div className={styles.countBadge}>
          {filteredCourses.length} Subjects Registered
        </div>

        <div className={styles.filters}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by code, title, or department..."
            className={styles.search}
          />
          <Select
            value={selectedDept}
            onChange={setSelectedDept}
            options={departmentOptions}
            className={styles.select}
          />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <ErrorState
          title="Could not load subjects catalog"
          message="Failed to retrieve courses from the server."
          onRetry={refetch}
        />
      ) : (
        <div className={styles.tableCard}>
          <DataTable
            columns={columns}
            data={filteredCourses}
            keyField="courseCode"
            isLoading={isLoading}
            emptyComponent={
              <EmptyState
                title="No subjects found"
                description={
                  searchQuery
                    ? 'No subjects match your search or filter.'
                    : 'No subjects have been configured yet.'
                }
                icon={BookOpen}
              />
            }
          />
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <SubjectFormModal
        key={editingCourse?.courseCode || 'new'}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingCourse}
        onSubmit={async (data) => {
          if (editingCourse) {
            await updateMutation.mutateAsync({
              courseCode: editingCourse.courseCode,
              data,
            });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCourse)}
        onClose={() => setDeletingCourse(null)}
        title={`Delete Subject: ${deletingCourse?.courseCode}`}
        message={`Are you sure you want to delete ${deletingCourse?.courseCode} - ${deletingCourse?.courseName}? This action cannot be reversed.`}
        confirmLabel="Delete Subject"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingCourse) {
            deleteMutation.mutate(deletingCourse.courseCode);
          }
        }}
      />

      {/* 409 Conflict Modal (Assigned course cannot be deleted -> Mark as INACTIVE) */}
      <Modal
        isOpen={Boolean(deleteConflict)}
        onClose={() => setDeleteConflict(null)}
        title="Cannot Delete Assigned Subject"
        maxWidth="500px"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteConflict(null)}
              disabled={markInactiveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (deleteConflict?.course) {
                  markInactiveMutation.mutate(deleteConflict.course);
                }
              }}
              isLoading={markInactiveMutation.isPending}
            >
              Mark as INACTIVE
            </Button>
          </>
        }
      >
        <div className={styles.conflictModalBody}>
          <div className={styles.conflictIconCircle}>
            <ShieldAlert size={28} className={styles.conflictIcon} />
          </div>
          <div className={styles.conflictTexts}>
            <h3 className={styles.conflictTitle}>
              Subject Conflict: {deleteConflict?.course?.courseCode}
            </h3>
            <p className={styles.conflictMessage}>{deleteConflict?.message}</p>
            <div className={styles.conflictNotice}>
              <AlertTriangle size={16} />
              <span>
                To preserve academic and student records, deactivating the subject will archive
                it from future scheduling without breaking existing assignments.
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
