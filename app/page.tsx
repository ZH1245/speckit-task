import { listTasks } from '@/lib/tasks';
import TaskList from '@/components/TaskList/TaskList';

export default async function Home(): Promise<JSX.Element> {
  const tasks = await listTasks();

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Tasks</h1>
      <TaskList tasks={tasks} />
    </main>
  );
}
