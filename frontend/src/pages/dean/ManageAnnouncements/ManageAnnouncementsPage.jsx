import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../../api/announcements';
import { useToast } from '../../../components/common/useToast';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Button } from '../../../components/common/Button';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { SkeletonCard } from '../../../components/common/Skeleton';
import { AnnouncementFormModal } from './AnnouncementFormModal';
import { formatDate } from '../../../utils/format';
import styles from './ManageAnnouncementsPage.module.css';
import { Megaphone, Plus, Edit2, Trash2, Calendar, User } from 'lucide-react';

export function ManageAnnouncementsPage() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    data: announcements = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      return (
        searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.postedBy && a.postedBy.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [announcements, searchQuery]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createAnnouncement(data),
    onSuccess: () => {
      toastSuccess('Announcement published', 'The memo is now live for all faculty members.');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err) => {
      toastError('Failed to publish announcement', err.detail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAnnouncement(id, data),
    onSuccess: () => {
      toastSuccess('Announcement updated', 'Changes have been saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err) => {
      toastError('Failed to update announcement', err.detail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAnnouncement(id),
    onSuccess: () => {
      toastSuccess('Announcement deleted', 'The memo has been permanently removed.');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setDeletingAnnouncement(null);
    },
    onError: (err) => {
      toastError('Failed to delete announcement', err.detail);
      setDeletingAnnouncement(null);
    },
  });

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingAnnouncement(item);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Manage Announcements"
        subtitle="Create, update, and manage official bulletins and administrative memos."
        icon={Megaphone}
        actions={
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            + Add New Announcement
          </Button>
        }
      />

      {/* Toolbar: Search, Count line, Sort label */}
      <div className={styles.toolbar}>
        <div className={styles.infoLine}>
          <span className={styles.countText}>
            <strong>{filteredAnnouncements.length}</strong> announcements
          </span>
          <span className={styles.sortLabel}>Sorted: Newest first</span>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search announcements..."
          className={styles.search}
        />
      </div>

      {/* Cards List */}
      {isError ? (
        <ErrorState
          title="Could not load announcements"
          message="Failed to retrieve announcements from the server."
          onRetry={refetch}
        />
      ) : isLoading ? (
        <div className={styles.cardsGrid}>
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No announcements found"
          description={
            searchQuery
              ? 'No announcements match your search keywords.'
              : 'You have not published any announcements yet.'
          }
          icon={Megaphone}
        />
      ) : (
        <div className={styles.cardsGrid}>
          {filteredAnnouncements.map((item) => (
            <article key={item.announcementId} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconTile}>
                  <Megaphone size={18} />
                </div>
                <div className={styles.headerTexts}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <Calendar size={13} />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <User size={13} />
                      <span>
                        {item.postedBy}
                        {item.postedByPosition ? ` (${item.postedByPosition})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.actionBtns}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => handleOpenEdit(item)}
                    title="Edit announcement"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => setDeletingAnnouncement(item)}
                    title="Delete announcement"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className={styles.previewContent}>{item.content}</p>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <AnnouncementFormModal
        key={editingAnnouncement?.announcementId || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingAnnouncement}
        onSubmit={async (data) => {
          if (editingAnnouncement) {
            await updateMutation.mutateAsync({
              id: editingAnnouncement.announcementId,
              data,
            });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingAnnouncement)}
        onClose={() => setDeletingAnnouncement(null)}
        title="Delete Announcement"
        message={`Are you sure you want to permanently delete "${deletingAnnouncement?.title}"? This cannot be undone.`}
        confirmLabel="Delete Announcement"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingAnnouncement) {
            deleteMutation.mutate(deletingAnnouncement.announcementId);
          }
        }}
      />
    </div>
  );
}
