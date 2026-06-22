import type { Task } from '@/types/task';
import TaskRow from './TaskRow';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headRow}>
            <th className={styles.th}>Title</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Priority</th>
            <th className={styles.th}>Created</th>
            <th className={styles.th} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
