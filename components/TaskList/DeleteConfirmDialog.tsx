'use client';

import { useState } from 'react';

import styles from './TaskList.module.css';

interface DeleteConfirmDialogProps {
  taskId: string;
  taskTitle: string;
  onDeleted: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  taskId,
  taskTitle,
  onDeleted,
  onCancel,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(): Promise<void> {
    setIsDeleting(true);
    setError(null);

    const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });

    if (response.ok) {
      onDeleted();
    } else {
      setError('Failed to delete task. Please try again.');
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <p className={styles.dialogTitle}>Delete task?</p>
        <p className={styles.dialogTask}>{taskTitle}</p>
        {error !== null && <p className={styles.dialogError}>{error}</p>}
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={() => {
              void handleDelete();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
