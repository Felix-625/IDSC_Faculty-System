import { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { FormField } from '../../../components/common/FormField';
import styles from './AnnouncementFormModal.module.css';
import { Megaphone, AlertCircle } from 'lucide-react';

export function AnnouncementFormModal({
  isOpen,
  onClose,
  onSubmit, // async ({ title, content }) => void
  initialData = null, // edit mode if present
}) {
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState(() => initialData?.title || '');
  const [content, setContent] = useState(() => initialData?.content || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Both title and content are required.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.detail || 'Failed to save announcement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Announcement' : 'Post New Announcement'}
      subtitle={
        isEdit
          ? 'Modify announcement title and description'
          : 'Broadcast university update or administrative memo to all faculty'
      }
      maxWidth="560px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            icon={Megaphone}
          >
            {isEdit ? 'Save Changes' : 'Publish Announcement'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {errorMessage && (
          <div className={styles.alertError} role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <FormField label="Announcement Title" id="announcementTitle" required>
          <input
            id="announcementTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Faculty General Assembly & Academic Briefing"
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="Announcement Content"
          id="announcementContent"
          required
          helpText="Detailed memo text. Line breaks will be preserved in the announcement view."
        >
          <textarea
            id="announcementContent"
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your official announcement or memo details here..."
            disabled={isLoading}
            className={styles.textarea}
          />
        </FormField>
      </form>
    </Modal>
  );
}
