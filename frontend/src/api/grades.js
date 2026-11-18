import { api } from './client';

export const ALLOWED_GRADES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];

export async function getAssignmentGrades(facultyId, assignmentId) {
  return api.get(
    `/faculty/${encodeURIComponent(facultyId)}/subjects/${encodeURIComponent(assignmentId)}/grades`
  );
}

export async function createGrade(facultyId, courseCode, studentId, { assignmentId, grade }) {
  return api.post(
    `/faculty/${encodeURIComponent(facultyId)}/courses/${encodeURIComponent(courseCode)}/students/${encodeURIComponent(studentId)}/grade`,
    { assignmentId, grade: Number(grade) }
  );
}

export async function updateGrade(facultyId, courseCode, studentId, { assignmentId, grade }) {
  return api.put(
    `/faculty/${encodeURIComponent(facultyId)}/courses/${encodeURIComponent(courseCode)}/students/${encodeURIComponent(studentId)}/grade`,
    { assignmentId, grade: Number(grade) }
  );
}

export async function getStudentGrade(facultyId, courseCode, studentId, assignmentId) {
  const query = assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : '';
  return api.get(
    `/faculty/${encodeURIComponent(facultyId)}/courses/${encodeURIComponent(courseCode)}/students/${encodeURIComponent(studentId)}/grade${query}`
  );
}
