import { useState, useMemo } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { useFacultySubjects, useFacultySchedule } from '../../../hooks/useFacultyData';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { EmptyState } from '../../../components/common/EmptyState';
import { SkeletonCard } from '../../../components/common/Skeleton';
import { ErrorState } from '../../../components/common/ErrorState';
import { SubjectCard } from './SubjectCard';
import { SubjectDetailsDrawer } from './SubjectDetailsDrawer';
import styles from './SubjectsPage.module.css';
import { BookOpen } from 'lucide-react';

export function SubjectsPage() {
  const { user } = useAuth();
  const facultyId = user?.facultyId;

  const {
    data: assignments = [],
    isLoading,
    isError,
    refetch,
  } = useFacultySubjects(facultyId);

  const { data: schedule = [] } = useFacultySchedule(facultyId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [activeDrawerAssignment, setActiveDrawerAssignment] = useState(null);

  // Distinct semesters from assignments
  const semesterOptions = useMemo(() => {
    const sems = Array.from(new Set(assignments.map((a) => a.semester).filter(Boolean)));
    return [
      { value: 'ALL', label: 'All Semesters' },
      ...sems.map((s) => ({ value: s, label: s })),
    ];
  }, [assignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.section.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSemester =
        selectedSemester === 'ALL' || item.semester === selectedSemester;

      return matchesSearch && matchesSemester;
    });
  }, [assignments, searchQuery, selectedSemester]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="My Subjects"
        subtitle="Manage and view your assigned subjects."
        icon={BookOpen}
      />

      {/* Toolbar: Search and Semester Filter */}
      <div className={styles.toolbar}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>My Assigned Subjects</h2>
          <span className={styles.countChip}>{filteredAssignments.length} Subjects</span>
        </div>

        <div className={styles.filters}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search subject or section..."
            className={styles.search}
          />
          <Select
            value={selectedSemester}
            onChange={setSelectedSemester}
            options={semesterOptions}
            className={styles.semesterSelect}
          />
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} lines={4} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load assigned subjects"
          message="Failed to retrieve assignments for your faculty account."
          onRetry={refetch}
        />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assigned subjects found"
          description={
            searchQuery
              ? 'No subjects match your search or filter criteria.'
              : 'You have not been assigned any subjects for this term yet.'
          }
          icon={BookOpen}
        />
      ) : (
        <div className={styles.grid}>
          {filteredAssignments.map((assignment) => (
            <SubjectCard
              key={assignment.assignmentId}
              assignment={assignment}
              schedule={schedule}
              onOpenDetails={(item) => setActiveDrawerAssignment(item)}
            />
          ))}
        </div>
      )}

      {/* Details Side Drawer */}
      <SubjectDetailsDrawer
        isOpen={Boolean(activeDrawerAssignment)}
        onClose={() => setActiveDrawerAssignment(null)}
        assignment={activeDrawerAssignment}
      />
    </div>
  );
}
