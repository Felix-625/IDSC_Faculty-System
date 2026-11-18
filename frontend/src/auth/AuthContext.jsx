import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './authContextDef';
import {
  getStoredToken,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
  setOnUnauthorized,
} from '../api/client';
import { login as apiLogin, getMe as apiGetMe } from '../api/auth';

function parseJwtExp(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(json);
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [sessionExpiry, setSessionExpiry] = useState(() => parseJwtExp(getStoredToken()));
  const [logoutMessage, setLogoutMessage] = useState(null);

  const logout = useCallback((message = null) => {
    clearStoredSession();
    setToken(null);
    setUser(null);
    setSessionExpiry(null);
    if (message) {
      setLogoutMessage(message);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      logout('Your session expired.');
    });
  }, [logout]);

  const loginUser = useCallback(async (facultyId, password) => {
    setLogoutMessage(null);
    const res = await apiLogin(facultyId, password);
    const { accessToken, user: basicUser } = res;
    setStoredSession(accessToken, basicUser);
    setToken(accessToken);
    setSessionExpiry(parseJwtExp(accessToken));

    try {
      // Refresh with full profile from /auth/me
      const fullProfile = await apiGetMe();
      const updatedUser = { ...basicUser, ...fullProfile };
      setStoredSession(accessToken, updatedUser);
      setUser(updatedUser);
      return updatedUser;
    } catch {
      setUser(basicUser);
      return basicUser;
    }
  }, []);

  const isDean = useMemo(() => user?.position === 'DEAN', [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      isDean,
      isAuthenticated: Boolean(token && user),
      sessionExpiry,
      logoutMessage,
      clearLogoutMessage: () => setLogoutMessage(null),
      login: loginUser,
      logout,
      setUser,
    }),
    [token, user, isDean, sessionExpiry, logoutMessage, loginUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
