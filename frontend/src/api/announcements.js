import { api } from './client';

export async function getAnnouncements() {
  return api.get('/announcements');
}

export async function getAnnouncement(id) {
  return api.get(`/announcements/${encodeURIComponent(id)}`);
}

export async function createAnnouncement({ title, content }) {
  return api.post('/announcements', { title, content });
}

export async function updateAnnouncement(id, { title, content }) {
  return api.put(`/announcements/${encodeURIComponent(id)}`, { title, content });
}

export async function deleteAnnouncement(id) {
  return api.delete(`/announcements/${encodeURIComponent(id)}`);
}
