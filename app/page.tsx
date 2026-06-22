import { listTasks } from '@/lib/tasks';
import TaskList from '@/components/TaskList/TaskList';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const tasks = await listTasks();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Tasks</h1>
      <p className={styles.subtitle}>
        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
      </p>
      {tasks.length === 0 ? (
        <div className={styles.empty}>No tasks yet. Create one via POST /api/tasks.</div>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </main>
  );
}
