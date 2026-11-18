import { useState, useMemo } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { useFacultySubjects } from '../../../hooks/useFacultyData';
import { useQueries } from '@tanstack/react-query';
import { getEnrolledStudents } from '../../../api/students';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { DataTable } from '../../../components/common/DataTable';
import { Pagination } from '../../../components/common/Pagination';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import styles from './StudentsPage.module.css';
import { Users, GraduationCap } from 'lucide-react';

export function StudentsPage() {
  const { user } = useAuth();
  const facultyId = user?.facultyId;

  // 1. Fetch all assigned subjects for this faculty
  const {
    data: assignments = [],
    isLoading: isLoadingSubjects,
    isError: isSubjectsError,
    refetch: refetchSubjects,
  } = useFacultySubjects(facultyId);

  // 2. Parallel fetch of enrolled students across each assignment
  const studentQueries = useQueries({
    queries: assignments.map((a) => ({
      queryKey: ['students', facultyId, a.courseCode, a.section, a.semester, a.academicYear],
      queryFn: () =>
        getEnrolledStudents(facultyId, a.courseCode, {
          section: a.section,
          semester: a.semester,
          academicYear: a.academicYear,
        }),
      enabled: Boolean(facultyId && a.courseCode),
    })),
  });

  const isLoadingStudents = studentQueries.some((q) => q.isLoading);

  // 3. Flatten and enrich students roster
  const allStudents = useMemo(() => {
    const list = [];
    assignments.forEach((assignment, idx) => {
      const students = studentQueries[idx]?.data || [];
      students.forEach((student) => {
        list.push({
          ...student,
          assignmentId: assignment.assignmentId,
          courseCode: assignment.courseCode,
          courseName: assignment.courseName,
          assignmentSection: assignment.section,
          // Composite unique key for table row
          rowId: `${student.studentId}-${assignment.assignmentId}`,
        });
      });
    });
    return list;
  }, [assignments, studentQueries]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Distinct filter options
  const sectionOptions = useMemo(() => {
    const sections = Array.from(
      new Set(allStudents.map((s) => s.section || s.assignmentSection).filter(Boolean))
    );
    return [
      { value: 'ALL', label: 'All Sections' },
      ...sections.map((sec) => ({ value: sec, label: sec })),
    ];
  }, [allStudents]);

  const subjectOptions = useMemo(() => {
    const subjects = Array.from(
      new Set(assignments.map((a) => a.courseCode).filter(Boolean))
    );
    return [
      { value: 'ALL', label: 'All Subjects' },
      ...subjects.map((code) => {
        const match = assignments.find((a) => a.courseCode === code);
        return { value: code, label: `${code} — ${match?.courseName || ''}` };
      }),
    ];
  }, [assignments]);

  // Filtered roster
  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      const matchesSearch =
        searchQuery === '' ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.program && student.program.toLowerCase().includes(searchQuery.toLowerCase()));

      const sectionVal = student.section || student.assignmentSection;
      const matchesSection = selectedSection === 'ALL' || sectionVal === selectedSection;

      const matchesSubject = selectedSubject === 'ALL' || student.courseCode === selectedSubject;

      return matchesSearch && matchesSection && matchesSubject;
    });
  }, [allStudents, searchQuery, selectedSection, selectedSubject]);

  // Paginated slice
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div className={styles.studentCell}>
          <span className={styles.studentName}>{row.name}</span>
          <span className={styles.studentSub}>
            {row.yearLevel ? `${row.yearLevel}th Year` : ''} · {row.program}
          </span>
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
      key: 'subject',
      header: 'Subject',
      render: (row) => (
        <div className={styles.subjectCell}>
          <span className={styles.subjectCode}>{row.courseCode}</span>
          <span className={styles.subjectName}>{row.courseName}</span>
        </div>
      ),
    },
    {
      key: 'section',
      header: 'Section',
      width: '120px',
      render: (row) => (
        <span className={styles.sectionBadge}>{row.section || row.assignmentSection}</span>
      ),
    },
    {
      key: 'yearLevel',
      header: 'Year',
      width: '100px',
      render: (row) => <span>{row.yearLevel ? `${row.yearLevel}th Year` : '—'}</span>,
    },
    {
      key: 'program',
      header: 'Course',
      width: '110px',
      render: (row) => <span className={styles.programBadge}>{row.program}</span>,
    },
    // TODO attendance endpoint - The "Attendance Action / Mark absent" column is omitted per Section 6 (Gaps and Decisions) item 2
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="My Students"
        subtitle="View and manage the enrolled students across all your active subject offerings."
        icon={Users}
      />

      {/* Toolbar: Search, Section Filter, Subject Filter */}
      <div className={styles.toolbar}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Student Roster</h2>
          <span className={styles.countBadge}>{filteredStudents.length} Students</span>
        </div>

        <div className={styles.filtersRow}>
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search by student name or ID..."
            className={styles.search}
          />
          <Select
            value={selectedSection}
            onChange={(val) => {
              setSelectedSection(val);
              setCurrentPage(1);
            }}
            options={sectionOptions}
            className={styles.select}
          />
          <Select
            value={selectedSubject}
            onChange={(val) => {
              setSelectedSubject(val);
              setCurrentPage(1);
            }}
            options={subjectOptions}
            className={styles.selectSubject}
          />
        </div>
      </div>

      {/* Main Table */}
      {isSubjectsError ? (
        <ErrorState
          title="Could not load subjects"
          message="Failed to retrieve assignments for student roster."
          onRetry={refetchSubjects}
        />
      ) : (
        <div className={styles.tableCard}>
          <DataTable
            columns={columns}
            data={paginatedStudents}
            keyField="rowId"
            isLoading={isLoadingSubjects || isLoadingStudents}
            emptyComponent={
              <EmptyState
                title="No enrolled students found"
                description={
                  searchQuery
                    ? 'No students matched your search criteria.'
                    : 'There are currently no enrolled students assigned to your subjects.'
                }
                icon={GraduationCap}
              />
            }
          />

          {!isLoadingSubjects && !isLoadingStudents && filteredStudents.length > 0 && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredStudents.length}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
