import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAnnouncementsRead } from '../../../hooks/useAnnouncementsRead';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { MetricCard } from '../../../components/common/MetricCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { formatDate } from '../../../utils/format';
import styles from './AnnouncementsPage.module.css';
import { Megaphone, BellRing, ArrowRight, Calendar, User } from 'lucide-react';

export function AnnouncementsPage() {
  const { announcements, unreadCount, isRead } = useAnnouncementsRead();

  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState('ALL'); // 'ALL' | 'NEW' | 'READ'

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());

      const read = isRead(item.announcementId);
      const matchesFilter =
        readFilter === 'ALL' ||
        (readFilter === 'NEW' && !read) ||
        (readFilter === 'READ' && read);

      return matchesSearch && matchesFilter;
    });
  }, [announcements, searchQuery, readFilter, isRead]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Announcements"
        subtitle="Stay updated with university news, academic notices, and department memos."
        icon={Megaphone}
      />

      {/* Two Stat Cards */}
      <div className={styles.statsRow}>
        <MetricCard
          title="Total Announcements"
          value={announcements.length}
          icon={Megaphone}
          caption="Published university notices"
        />
        <MetricCard
          title="New Updates"
          value={unreadCount}
          icon={BellRing}
          caption="Unread announcements awaiting review"
        />
      </div>

      {/* Toolbar: Search and Read Filter */}
      <div className={styles.toolbar}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search announcements..."
          className={styles.search}
        />

        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.tab} ${readFilter === 'ALL' ? styles.tabActive : ''}`}
            onClick={() => setReadFilter('ALL')}
          >
            All ({announcements.length})
          </button>
          <button
            type="button"
            className={`${styles.tab} ${readFilter === 'NEW' ? styles.tabActive : ''}`}
            onClick={() => setReadFilter('NEW')}
          >
            New ({unreadCount})
          </button>
          <button
            type="button"
            className={`${styles.tab} ${readFilter === 'READ' ? styles.tabActive : ''}`}
            onClick={() => setReadFilter('READ')}
          >
            Read ({announcements.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No announcements found"
          description={
            searchQuery
              ? 'No announcements match your search criteria.'
              : 'There are no announcements currently published.'
          }
          icon={Megaphone}
        />
      ) : (
        <div className={styles.announcementList}>
          {filteredAnnouncements.map((item) => {
            const isUnread = !isRead(item.announcementId);

            return (
              <article key={item.announcementId} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.titleArea}>
                    {isUnread && (
                      <span className={styles.newChip}>
                        <span className={styles.dot} />
                        NEW
                      </span>
                    )}
                    <h3 className={styles.title}>{item.title}</h3>
                  </div>
                  <div className={styles.dateMeta}>
                    <Calendar size={14} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <p className={styles.previewText}>{item.content}</p>

                <div className={styles.cardBottom}>
                  <div className={styles.authorMeta}>
                    <User size={14} className={styles.authorIcon} />
                    <span>
                      Posted by <strong>{item.postedBy}</strong>
                      {item.postedByPosition ? ` (${item.postedByPosition})` : ''}
                    </span>
                  </div>

                  <Link
                    to={`/announcements/${item.announcementId}`}
                    className={styles.readMoreBtn}
                  >
                    <span>Read More</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
