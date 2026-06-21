import type { Task } from '@/types/task';
import TaskRow from './TaskRow';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      <thead>
        <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
          <th style={{ padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontWeight: 600 }}>Title</th>
          <th style={{ padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontWeight: 600 }}>Status</th>
          <th style={{ padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontWeight: 600 }}>Priority</th>
          <th style={{ padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontWeight: 600 }}>Created</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </tbody>
    </table>
  );
}
