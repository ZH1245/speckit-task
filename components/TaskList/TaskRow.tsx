'use client';

import { Fragment, useState } from 'react';

import type { Task } from '@/types/task';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import InlineEditField from './InlineEditField';
import StatusSelect from './StatusSelect';
import PrioritySelect from './PrioritySelect';
import styles from './TaskList.module.css';

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
      <tr className={styles.row}>
        <td className={styles.td}>
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
        <td className={styles.td}>
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
        <td className={styles.td}>
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
        <td className={`${styles.td} ${styles.dateCell}`}>{formattedDate}</td>
        <td className={styles.td}>
          <button className={styles.deleteBtn} onClick={() => setShowDialog(true)}>
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
