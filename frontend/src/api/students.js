import { api } from './client';

export async function getEnrolledStudents(
  facultyId,
  courseCode,
  { section, semester, academicYear }
) {
  const query = new URLSearchParams({
    section,
    semester,
    academicYear,
  }).toString();

  return api.get(
    `/faculty/${encodeURIComponent(facultyId)}/courses/${encodeURIComponent(courseCode)}/students?${query}`
  );
}
