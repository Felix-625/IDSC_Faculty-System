import { useQueries } from '@tanstack/react-query';
import { getEnrolledStudents } from '../api/students';
import { getAssignmentGrades } from '../api/grades';

export function useFacultyStats(facultyId, assignments = []) {
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

  const gradeQueries = useQueries({
    queries: assignments.map((a) => ({
      queryKey: ['grades', facultyId, a.assignmentId],
      queryFn: () => getAssignmentGrades(facultyId, a.assignmentId),
      enabled: Boolean(facultyId && a.assignmentId),
    })),
  });

  const isLoading =
    studentQueries.some((q) => q.isLoading) || gradeQueries.some((q) => q.isLoading);

  let totalStudents = 0;
  let pendingGrades = 0;

  assignments.forEach((assignment, idx) => {
    const students = studentQueries[idx]?.data || [];
    const grades = gradeQueries[idx]?.data || [];
    totalStudents += students.length;

    const gradedIds = new Set(grades.map((g) => g.studentId));
    const pendingCount = students.filter((s) => !gradedIds.has(s.studentId)).length;
    pendingGrades += pendingCount;
  });

  return {
    totalStudents,
    pendingGrades,
    isLoading,
  };
}
