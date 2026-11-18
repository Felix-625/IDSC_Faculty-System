import { api } from './client';

export async function getSchedules({ section, facultyId, day } = {}) {
  const params = new URLSearchParams();
  if (section) params.set('section', section);
  if (facultyId) params.set('facultyId', facultyId);
  if (day) params.set('day', day);

  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get(`/schedules${query}`);
}

export async function createSchedule(data) {
  return api.post('/schedules', data);
}

export async function getSchedule(scheduleId) {
  return api.get(`/schedules/${encodeURIComponent(scheduleId)}`);
}

export async function updateSchedule(scheduleId, data) {
  return api.put(`/schedules/${encodeURIComponent(scheduleId)}`, data);
}

export async function deleteSchedule(scheduleId) {
  return api.delete(`/schedules/${encodeURIComponent(scheduleId)}`);
}

export async function getFacultySchedule(facultyId) {
  return api.get(`/faculty/${encodeURIComponent(facultyId)}/schedule`);
}
