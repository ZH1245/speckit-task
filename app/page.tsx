import { listTasks } from '@/lib/tasks';
import TaskList from '@/components/TaskList/TaskList';
import CreateTaskForm from '@/components/TaskList/CreateTaskForm';
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
      <CreateTaskForm />
      {tasks.length === 0 ? (
        <div className={styles.empty}>No tasks yet. Add your first one above.</div>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </main>
  );
}
