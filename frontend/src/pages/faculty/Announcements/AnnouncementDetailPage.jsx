import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAnnouncement } from '../../../api/announcements';
import { useAnnouncementsRead } from '../../../hooks/useAnnouncementsRead';
import { formatDate } from '../../../utils/format';
import { SkeletonCard } from '../../../components/common/Skeleton';
import { ErrorState } from '../../../components/common/ErrorState';
import styles from './AnnouncementDetailPage.module.css';
import { ArrowLeft, Calendar, User, Shield } from 'lucide-react';

export function AnnouncementDetailPage() {
  const { announcementId } = useParams();
  const { markAsRead, isRead } = useAnnouncementsRead();

  const {
    data: announcement,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['announcement', announcementId],
    queryFn: () => getAnnouncement(announcementId),
    enabled: Boolean(announcementId),
  });

  const isUnread = !isRead(announcementId);

  useEffect(() => {
    if (announcementId) {
      markAsRead(announcementId);
    }
  }, [announcementId, markAsRead]);

  return (
    <div className={styles.container}>
      {/* Back button */}
      <div>
        <Link to="/announcements" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Announcements</span>
        </Link>
      </div>

      {isLoading ? (
        <SkeletonCard lines={6} />
      ) : isError || !announcement ? (
        <ErrorState
          title="Announcement not found"
          message="Could not load the announcement details."
          onRetry={refetch}
        />
      ) : (
        <article className={styles.articleCard}>
          <div className={styles.header}>
            <div className={styles.metaTop}>
              {isUnread && (
                <span className={styles.newChip}>
                  <span className={styles.dot} />
                  NEW
                </span>
              )}
              <div className={styles.dateMeta}>
                <Calendar size={15} />
                <span>Published on {formatDate(announcement.createdAt)}</span>
              </div>
            </div>

            <h1 className={styles.title}>{announcement.title}</h1>
          </div>

          <div className={styles.divider} />

          <div className={styles.content}>
            <p className={styles.paragraph}>{announcement.content}</p>
          </div>

          <div className={styles.divider} />

          <div className={styles.footer}>
            <div className={styles.authorBadge}>
              <div className={styles.authorIconBox}>
                <User size={18} />
              </div>
              <div>
                <div className={styles.postedBy}>
                  Posted by <strong>{announcement.postedBy}</strong>
                </div>
                <div className={styles.authorRole}>
                  <Shield size={12} />
                  <span>{announcement.postedByPosition || 'Administration'}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
