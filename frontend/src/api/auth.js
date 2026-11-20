import { api } from './client';

export async function login(facultyId, password) {
  return api.post('/auth/login', { facultyId, password });
}

export async function getMe() {
  return api.get('/auth/me');
}

export async function changePassword(currentPassword, newPassword) {
  return api.patch(
    '/auth/password',
    { currentPassword, newPassword },
    { skipUnauthorizedHandler: true }
  );
}
