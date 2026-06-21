'use client';

import { Fragment, useState } from 'react';
import type { CSSProperties } from 'react';

import type { Task } from '@/types/task';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import InlineEditField from './InlineEditField';
import StatusSelect from './StatusSelect';
import PrioritySelect from './PrioritySelect';

const cellStyle: CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
};

const deleteButtonStyle: CSSProperties = {
  padding: '4px 10px',
  borderRadius: '4px',
  border: '1px solid #fca5a5',
  backgroundColor: '#fff1f2',
  color: '#dc2626',
  fontSize: '0.75rem',
  fontWeight: 500,
  cursor: 'pointer',
};

interface TaskRowProps {
  task: Task;
}

export default function TaskRow({ task }: TaskRowProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task>(task);

  const formattedDate = new Date(currentTask.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Fragment>
      <tr>
        <td style={cellStyle}>
          <InlineEditField
            value={currentTask.title}
            onSave={async (title) => {
              await fetch(`/api/tasks/${currentTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
              });
              setCurrentTask((t) => ({ ...t, title }));
            }}
          />
        </td>
        <td style={cellStyle}>
          <StatusSelect
            value={currentTask.status}
            onChange={async (status) => {
              await fetch(`/api/tasks/${currentTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
              });
              setCurrentTask((t) => ({ ...t, status }));
            }}
          />
        </td>
        <td style={cellStyle}>
          <PrioritySelect
            value={currentTask.priority}
            onChange={async (priority) => {
              await fetch(`/api/tasks/${currentTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority }),
              });
              setCurrentTask((t) => ({ ...t, priority }));
            }}
          />
        </td>
        <td style={{ ...cellStyle, color: '#6b7280', fontSize: '0.875rem' }}>
          {formattedDate}
        </td>
        <td style={cellStyle}>
          <button style={deleteButtonStyle} onClick={() => setShowDialog(true)}>
            Delete
          </button>
        </td>
      </tr>
      {showDialog && (
        <DeleteConfirmDialog
          taskId={currentTask.id}
          taskTitle={currentTask.title}
          onDeleted={() => {
            setShowDialog(false);
            window.location.reload();
          }}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </Fragment>
  );
}
