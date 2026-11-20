const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(status, detail, errors = [], raw = {}) {
    super(detail || `HTTP Error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail || 'An unexpected error occurred.';
    this.errors = Array.isArray(errors) ? errors : [];
    this.title = raw.title || '';
    this.raw = raw;
  }
}

export const TOKEN_KEY = 'idsc_faculty_token';
export const USER_KEY = 'idsc_faculty_user';

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let onUnauthorizedCallback = null;

export function setOnUnauthorized(callback) {
  onUnauthorizedCallback = callback;
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError(
      0,
      'Cannot reach the server. Please check your network connection.',
      [],
      { originalError: err }
    );
  }

    // skipUnauthorizedHandler: a wrong current password also returns 401 and must not log the user out.
  if (response.status === 401 && !options.skipUnauthorizedHandler) {
    clearStoredSession();
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
  }

  if (response.status === 204) {
    return null;
  }

  let body;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const detail =
      body?.detail ||
      (typeof body === 'string' && body.trim() ? body : `Request failed with status ${response.status}`);
    const errors = body?.errors || [];
    throw new ApiError(response.status, detail, errors, body);
  }

  return body;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
