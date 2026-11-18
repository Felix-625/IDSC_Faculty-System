import { api } from './client';

export async function getFacultyList() {
  return api.get('/faculty');
}

export async function createFaculty(data) {
  return api.post('/faculty', data);
}

export async function getFacultyById(facultyId) {
  return api.get(`/faculty/${encodeURIComponent(facultyId)}`);
}

export async function updateFaculty(facultyId, data) {
  return api.put(`/faculty/${encodeURIComponent(facultyId)}`, data);
}

export async function getFacultySalary(facultyId) {
  return api.get(`/faculty/${encodeURIComponent(facultyId)}/salary`);
}

export async function getFacultySubjects(facultyId) {
  return api.get(`/faculty/${encodeURIComponent(facultyId)}/subjects`);
}

export async function assignSubject(facultyId, data) {
  return api.post(`/faculty/${encodeURIComponent(facultyId)}/subjects`, data);
}

export async function removeSubject(facultyId, assignmentId) {
  return api.delete(
    `/faculty/${encodeURIComponent(facultyId)}/subjects/${encodeURIComponent(assignmentId)}`
  );
}

export async function getFacultyCourses(facultyId) {
  return api.get(`/faculty/${encodeURIComponent(facultyId)}/courses`);
}
