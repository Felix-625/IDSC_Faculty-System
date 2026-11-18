import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../../auth/useAuth';
import { useFacultySubjects } from '../../../hooks/useFacultyData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEnrolledStudents } from '../../../api/students';
import {
  getAssignmentGrades,
  createGrade as apiCreateGrade,
  updateGrade as apiUpdateGrade,
} from '../../../api/grades';
import { useToast } from '../../../components/common/useToast';
import { Breadcrumbs } from '../../../components/common/Breadcrumbs';
import { Button } from '../../../components/common/Button';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { StatusChip } from '../../../components/common/StatusChip';
import { MetricCard } from '../../../components/common/MetricCard';
import { DataTable } from '../../../components/common/DataTable';
import { Pagination } from '../../../components/common/Pagination';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { EnterGradeModal } from './EnterGradeModal';
import { EditGradeModal } from './EditGradeModal';
import { formatGrade, formatDate } from '../../../utils/format';
import styles from './GradesPage.module.css';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  GraduationCap,
} from 'lucide-react';

export function GradesPage() {
  const { user } = useAuth();
  const facultyId = user?.facultyId;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  // 1. Fetch faculty assignments
  const {
    data: assignments = [],
    isError: isAssignmentsError,
    refetch: refetchAssignments,
  } = useFacultySubjects(facultyId);

  // 2. Determine active assignment from ?assignmentId= or default to first
  const assignmentIdParam = searchParams.get('assignmentId');
  const activeAssignment = useMemo(() => {
    if (!assignments || assignments.length === 0) return null;
    if (assignmentIdParam) {
      const found = assignments.find((a) => a.assignmentId === assignmentIdParam);
      if (found) return found;
    }
    return assignments[0];
  }, [assignments, assignmentIdParam]);

  const activeAssignmentId = activeAssignment?.assignmentId;

  // Handle assignment switch
  const handleSelectAssignment = (newAssignmentId) => {
    setSearchParams({ assignmentId: newAssignmentId });
    setCurrentPage(1);
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  // 3. Fetch students enrolled in this active assignment
  const {
    data: students = [],
    isLoading: isLoadingStudents,
    isError: isStudentsError,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: [
      'students',
      facultyId,
      activeAssignment?.courseCode,
      activeAssignment?.section,
      activeAssignment?.semester,
      activeAssignment?.academicYear,
    ],
    queryFn: () =>
      getEnrolledStudents(facultyId, activeAssignment.courseCode, {
        section: activeAssignment.section,
        semester: activeAssignment.semester,
        academicYear: activeAssignment.academicYear,
      }),
    enabled: Boolean(facultyId && activeAssignment?.courseCode),
  });

  // 4. Fetch grades for this assignment
  const {
    data: grades = [],
    isLoading: isLoadingGrades,
    isError: isGradesError,
    refetch: refetchGrades,
  } = useQuery({
    queryKey: ['grades', facultyId, activeAssignmentId],
    queryFn: () => getAssignmentGrades(facultyId, activeAssignmentId),
    enabled: Boolean(facultyId && activeAssignmentId),
  });

  // 5. Data join: students LEFT JOIN grades
  const joinedRoster = useMemo(() => {
    return students.map((student) => {
      const matchGrade = grades.find((g) => g.studentId === student.studentId);
      return {
        ...student,
        gradeRecord: matchGrade || null,
        grade: matchGrade ? matchGrade.grade : null,
        status: matchGrade ? matchGrade.status : 'PENDING',
        updatedAt: matchGrade ? matchGrade.updatedAt : null,
      };
    });
  }, [students, grades]);

  // Statistics
  const totalStudentsCount = joinedRoster.length;
  const postedCount = joinedRoster.filter((r) => r.gradeRecord !== null).length;
  const pendingCount = totalStudentsCount - postedCount;

  // Pending students list (for toolbar "+ Enter Grade")
  const pendingStudentsList = useMemo(() => {
    return joinedRoster.filter((r) => r.gradeRecord === null);
  }, [joinedRoster]);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'POSTED' | 'PENDING'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Client-side pages of 6 per Section 5.5

  const filteredRoster = useMemo(() => {
    return joinedRoster.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentId.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'POSTED') {
        matchesStatus = item.status === 'POSTED' || item.status === 'UPDATED';
      } else if (statusFilter === 'PENDING') {
        matchesStatus = item.status === 'PENDING';
      }

      return matchesSearch && matchesStatus;
    });
  }, [joinedRoster, searchQuery, statusFilter]);

  const paginatedRoster = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoster.slice(start, start + pageSize);
  }, [filteredRoster, currentPage]);

  // Modals state
  const [isEnterModalOpen, setIsEnterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);

  // Mutations
  const createGradeMutation = useMutation({
    mutationFn: ({ studentId, grade }) =>
      apiCreateGrade(facultyId, activeAssignment.courseCode, studentId, {
        assignmentId: activeAssignmentId,
        grade,
      }),
    onSuccess: (_, vars) => {
      toastSuccess('Grade posted successfully', `Student ${vars.studentId} grade is recorded.`);
      queryClient.invalidateQueries({ queryKey: ['grades', facultyId, activeAssignmentId] });
      queryClient.invalidateQueries({ queryKey: ['students', facultyId] });
    },
    onError: (err) => {
      toastError('Failed to post grade', err.detail || 'Could not record grade.');
    },
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ studentId, grade }) =>
      apiUpdateGrade(facultyId, activeAssignment.courseCode, studentId, {
        assignmentId: activeAssignmentId,
        grade,
      }),
    onSuccess: (_, vars) => {
      toastSuccess('Grade updated successfully', `Student ${vars.studentId} grade updated.`);
      queryClient.invalidateQueries({ queryKey: ['grades', facultyId, activeAssignmentId] });
      queryClient.invalidateQueries({ queryKey: ['students', facultyId] });
    },
    onError: (err) => {
      toastError('Failed to update grade', err.detail || 'Could not update grade.');
    },
  });

  const handleOpenEnterGrade = (student = null) => {
    setSelectedStudentForAction(student);
    setIsEnterModalOpen(true);
  };

  const handleOpenEditGrade = (student) => {
    setSelectedStudentForAction(student);
    setIsEditModalOpen(true);
  };

  const handleSwitchToEdit = (student) => {
    setIsEnterModalOpen(false);
    setSelectedStudentForAction(student);
    setIsEditModalOpen(true);
  };

  // Assignment dropdown options
  const assignmentOptions = assignments.map((a) => ({
    value: a.assignmentId,
    label: `${a.courseCode} — ${a.courseName} · ${a.section}`,
  }));

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div className={styles.studentCell}>
          <span className={styles.studentName}>{row.name}</span>
          <span className={styles.studentSection}>{row.section || activeAssignment?.section}</span>
        </div>
      ),
    },
    {
      key: 'studentId',
      header: 'Student ID',
      width: '140px',
      render: (row) => <code className={styles.idCode}>{row.studentId}</code>,
    },
    {
      key: 'grade',
      header: 'Grade',
      width: '100px',
      render: (row) => (
        <span className={row.grade ? styles.gradeValue : styles.gradeEmpty}>
          {formatGrade(row.grade)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (row) => {
        if (row.status === 'POSTED') {
          return <StatusChip status="Posted" variant="success" />;
        }
        if (row.status === 'UPDATED') {
          return <StatusChip status="Updated" variant="info" />;
        }
        return <StatusChip status="Pending" variant="warning" />;
      },
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      width: '140px',
      render: (row) => (
        <span className={styles.dateText}>{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      width: '130px',
      align: 'right',
      render: (row) => {
        if (row.gradeRecord) {
          return (
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => handleOpenEditGrade(row)}
            >
              Edit
            </Button>
          );
        }
        return (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => handleOpenEnterGrade(row)}
          >
            Enter Grade
          </Button>
        );
      },
    },
  ];

  const breadcrumbs = [
    { label: 'My Subjects', to: '/subjects' },
    { label: 'Grades' },
  ];

  return (
    <div className={styles.container}>
      {/* Breadcrumbs and Back Link */}
      <div className={styles.navHeader}>
        <Breadcrumbs items={breadcrumbs} />
        <Link to="/subjects" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to My Subjects</span>
        </Link>
      </div>

      {/* Assignment Selector Dropdown */}
      <div className={styles.selectorBar}>
        <label htmlFor="assignmentSelect" className={styles.selectorLabel}>
          Subject Offering:
        </label>
        <Select
          id="assignmentSelect"
          value={activeAssignmentId || ''}
          onChange={handleSelectAssignment}
          options={assignmentOptions}
          className={styles.assignmentSelect}
        />
      </div>

      {isAssignmentsError ? (
        <ErrorState
          title="Could not load assignments"
          message="Failed to retrieve faculty assignments."
          onRetry={refetchAssignments}
        />
      ) : !activeAssignment ? (
        <EmptyState
          title="No active subject selected"
          description="You do not have any active subjects assigned this semester."
          icon={GraduationCap}
        />
      ) : (
        <>
          {/* Offering Info Card */}
          <div className={styles.infoCard}>
            <div className={styles.infoLeft}>
              <div className={styles.codeBadge}>{activeAssignment.courseCode}</div>
              <div className={styles.infoTexts}>
                <h1 className={styles.courseTitle}>{activeAssignment.courseName}</h1>
                <p className={styles.offeringMeta}>
                  Section {activeAssignment.section} • Semester {activeAssignment.semester} •
                  Academic Year {activeAssignment.academicYear}
                </p>
              </div>
            </div>
            <div className={styles.infoRight}>
              <span className={styles.enrolledCount}>{totalStudentsCount}</span>
              <span className={styles.enrolledLabel}>Total Enrolled</span>
            </div>
          </div>

          {/* 3 Stat Cards */}
          <div className={styles.statsGrid}>
            <MetricCard
              title="Total Students"
              value={totalStudentsCount}
              icon={Users}
              caption="Enrolled in this section"
              isLoading={isLoadingStudents}
            />
            <MetricCard
              title="Grades Posted"
              value={postedCount}
              icon={CheckCircle2}
              caption="Submissions completed"
              isLoading={isLoadingGrades}
            />
            <MetricCard
              title="Grades Pending"
              value={pendingCount}
              icon={Clock}
              caption="Awaiting evaluation"
              isLoading={isLoadingStudents || isLoadingGrades}
            />
          </div>

          {/* Table Toolbar */}
          <div className={styles.tableToolbar}>
            <div className={styles.toolbarLeft}>
              <SearchInput
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
                placeholder="Search student name or ID..."
                className={styles.search}
              />

              <div className={styles.statusFilters}>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${statusFilter === 'ALL' ? styles.filterActive : ''}`}
                  onClick={() => {
                    setStatusFilter('ALL');
                    setCurrentPage(1);
                  }}
                >
                  All ({totalStudentsCount})
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${statusFilter === 'POSTED' ? styles.filterActive : ''}`}
                  onClick={() => {
                    setStatusFilter('POSTED');
                    setCurrentPage(1);
                  }}
                >
                  Posted ({postedCount})
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${statusFilter === 'PENDING' ? styles.filterActive : ''}`}
                  onClick={() => {
                    setStatusFilter('PENDING');
                    setCurrentPage(1);
                  }}
                >
                  Pending ({pendingCount})
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              icon={Plus}
              onClick={() => handleOpenEnterGrade(null)}
              disabled={pendingStudentsList.length === 0}
            >
              Enter Grade
            </Button>
          </div>

          {/* Grades Table */}
          {isStudentsError || isGradesError ? (
            <ErrorState
              title="Error loading grade roster"
              message="Failed to load student roster or grade records."
              onRetry={() => {
                refetchStudents();
                refetchGrades();
              }}
            />
          ) : (
            <div className={styles.tableCard}>
              <DataTable
                columns={columns}
                data={paginatedRoster}
                keyField="studentId"
                isLoading={isLoadingStudents || isLoadingGrades}
                emptyComponent={
                  <EmptyState
                    title="No students found"
                    description={
                      searchQuery
                        ? 'No student matches your search query.'
                        : 'No students enrolled for this section.'
                    }
                    icon={GraduationCap}
                  />
                }
              />

              {!isLoadingStudents && !isLoadingGrades && filteredRoster.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={filteredRoster.length}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}

          {/* Enter Grade Modal */}
          <EnterGradeModal
            key={(selectedStudentForAction?.studentId || 'general') + '-' + String(isEnterModalOpen)}
            isOpen={isEnterModalOpen}
            onClose={() => setIsEnterModalOpen(false)}
            assignment={activeAssignment}
            student={selectedStudentForAction}
            pendingStudents={pendingStudentsList}
            onSwitchToEdit={handleSwitchToEdit}
            onSubmit={async (studentId, grade) => {
              await createGradeMutation.mutateAsync({ studentId, grade });
            }}
          />

          {/* Edit Grade Modal */}
          <EditGradeModal
            key={(selectedStudentForAction?.studentId || 'edit') + '-' + String(selectedStudentForAction?.grade)}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            assignment={activeAssignment}
            student={selectedStudentForAction}
            currentGrade={selectedStudentForAction?.grade}
            onSubmit={async (studentId, grade) => {
              await updateGradeMutation.mutateAsync({ studentId, grade });
            }}
          />
        </>
      )}
    </div>
  );
}
