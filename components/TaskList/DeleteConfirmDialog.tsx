'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

interface DeleteConfirmDialogProps {
  taskId: string;
  taskTitle: string;
  onDeleted: () => void;
  onCancel: () => void;
}

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};

const dialogStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '24px',
  minWidth: '320px',
  maxWidth: '480px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
};

const headingStyle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#111827',
};

const taskTitleStyle: CSSProperties = {
  margin: '0 0 24px',
  fontSize: '0.875rem',
  color: '#6b7280',
  wordBreak: 'break-word',
};

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
};

const cancelButtonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#ffffff',
  color: '#374151',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
};

const deleteButtonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#dc2626',
  color: '#ffffff',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
};

const deleteButtonDisabledStyle: CSSProperties = {
  ...deleteButtonStyle,
  backgroundColor: '#fca5a5',
  cursor: 'not-allowed',
};

const errorStyle: CSSProperties = {
  margin: '0 0 16px',
  fontSize: '0.875rem',
  color: '#dc2626',
};

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
    <div style={backdropStyle}>
      <div style={dialogStyle}>
        <p style={headingStyle}>Delete task?</p>
        <p style={taskTitleStyle}>{taskTitle}</p>
        {error !== null && <p style={errorStyle}>{error}</p>}
        <div style={buttonRowStyle}>
          <button
            style={cancelButtonStyle}
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            style={isDeleting ? deleteButtonDisabledStyle : deleteButtonStyle}
            onClick={() => { void handleDelete(); }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
