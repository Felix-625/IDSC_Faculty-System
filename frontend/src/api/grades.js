import { api } from './client';

export const NUMERIC_GRADES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];
export const NON_NUMERIC_MARKS = ['INC', 'DRP', 'W'];
export const ALLOWED_GRADES = [...NUMERIC_GRADES, ...NON_NUMERIC_MARKS];

const formatGradePayload = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (NON_NUMERIC_MARKS.includes(String(value).trim().toUpperCase())) {
    return String(value).trim().toUpperCase();
  }
  const num = Number(value);
  return isNaN(num) ? value : num;
};

export async function getAssignmentGrades(facultyId, assignmentId) {
  return api.get(
    `/faculty/${encodeURIComponent(facultyId)}/subjects/${encodeURIComponent(assignmentId)}/grades`
  );
}

export async function createGrade(
  facultyId,
  courseCode,
  studentId,
  { assignmentId, grade, components, remarks, reason }
) {
  return api.post(
    `/faculty/${encodeURIComponent(facultyId)}/courses/${encodeURIComponent(courseCode)}/students/${encodeURIComponent(studentId)}/grade`,
    {
      assignmentId,
      grade: formatGradePayload(grade),
      components: components
        ? {
            prelim: formatGradePayload(components.prelim),
            midterm: formatGradePayload(components.midterm),
            preFinal: formatGradePayload(components.preFinal),
            final: formatGradePayload(components.final),
          }
        : undefined,
      remarks,
      reason,
    }
  );
}

export async function updateGrade(
  facultyId,
  courseCode,
  studentId,
  { assignmentId, grade, components, remarks, reason }
) {
  return api.put(
    `/faculty/${encodeURIComponent(facultyId)}/courses/${encodeURIComponent(courseCode)}/students/${encodeURIComponent(studentId)}/grade`,
    {
      assignmentId,
      grade: formatGradePayload(grade),
      components: components
        ? {
            prelim: formatGradePayload(components.prelim),
            midterm: formatGradePayload(components.midterm),
            preFinal: formatGradePayload(components.preFinal),
            final: formatGradePayload(components.final),
          }
        : undefined,
      remarks,
      reason,
    }
  );
}

export async function getStudentGrade(facultyId, courseCode, studentId, assignmentId) {
  const query = assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : '';
  return api.get(
    `/faculty/${encodeURIComponent(facultyId)}/courses/${encodeURIComponent(courseCode)}/students/${encodeURIComponent(studentId)}/grade${query}`
  );
}
