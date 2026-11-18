import { api } from './client';

export async function getCourses() {
  return api.get('/courses');
}

export async function getCourse(courseCode) {
  return api.get(`/courses/${encodeURIComponent(courseCode)}`);
}

export async function createCourse(data) {
  return api.post('/courses', data);
}

export async function updateCourse(courseCode, data) {
  return api.put(`/courses/${encodeURIComponent(courseCode)}`, data);
}

export async function deleteCourse(courseCode) {
  return api.delete(`/courses/${encodeURIComponent(courseCode)}`);
}
