import { useState, useCallback } from 'react';
import { useAuth } from '../auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getAnnouncements } from '../api/announcements';

function getStoredReadIds(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function useAnnouncementsRead() {
  const { user } = useAuth();
  const facultyId = user?.facultyId || 'guest';
  const storageKey = `idsc_read_announcements_${facultyId}`;

  const [readIds, setReadIds] = useState(() => getStoredReadIds(storageKey));

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    staleTime: 1000 * 60 * 2,
  });

  const markAsRead = useCallback(
    (id) => {
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {
          // ignore localStorage error
        }
        return next;
      });
    },
    [storageKey]
  );

  const unreadCount = announcements.filter((a) => !readIds.has(a.announcementId)).length;

  return {
    announcements,
    readIds,
    markAsRead,
    unreadCount,
    isRead: (id) => readIds.has(id),
  };
}
