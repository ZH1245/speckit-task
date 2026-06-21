'use client';

import type { Task } from '@/types/task';

const statusStyle: Record<Task['status'], React.CSSProperties> = {
  'todo': { backgroundColor: '#e5e7eb', color: '#374151' },
  'in-progress': { backgroundColor: '#dbeafe', color: '#1e40af' },
  'done': { backgroundColor: '#d1fae5', color: '#065f46' },
};

const priorityStyle: Record<Task['priority'], React.CSSProperties> = {
  'low': { backgroundColor: '#f3f4f6', color: '#6b7280' },
  'medium': { backgroundColor: '#fef9c3', color: '#854d0e' },
  'high': { backgroundColor: '#fee2e2', color: '#991b1b' },
};

const badgeStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 500,
};

const cellStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
};

interface TaskRowProps {
  task: Task;
}

export default function TaskRow({ task }: TaskRowProps) {
  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <tr>
      <td style={cellStyle}>{task.title}</td>
      <td style={cellStyle}>
        <span style={{ ...badgeStyle, ...statusStyle[task.status] }}>
          {task.status}
        </span>
      </td>
      <td style={cellStyle}>
        <span style={{ ...badgeStyle, ...priorityStyle[task.priority] }}>
          {task.priority}
        </span>
      </td>
      <td style={{ ...cellStyle, color: '#6b7280', fontSize: '0.875rem' }}>
        {formattedDate}
      </td>
    </tr>
  );
}
