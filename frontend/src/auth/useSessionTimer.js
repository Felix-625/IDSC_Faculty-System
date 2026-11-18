import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

function getRemainingSeconds(sessionExpiry) {
  if (!sessionExpiry) return 0;
  return Math.max(0, Math.floor((sessionExpiry - Date.now()) / 1000));
}

export function useSessionTimer() {
  const { sessionExpiry, logout } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(() => getRemainingSeconds(sessionExpiry));

  useEffect(() => {
    if (!sessionExpiry) return;

    const interval = setInterval(() => {
      const secs = getRemainingSeconds(sessionExpiry);
      setSecondsLeft(secs);

      if (secs <= 0) {
        clearInterval(interval);
        logout('Your session expired.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiry, logout]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');

  return {
    secondsLeft,
    formattedTime,
    isExpired: secondsLeft <= 0 && Boolean(sessionExpiry),
  };
}
