import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { listTasks, createTask } from '@/lib/tasks';

describe('GET /api/tasks — listTasks()', () => {
  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE tasks`);
  });

  test('returns empty array when no tasks exist', async () => {
    const result = await listTasks();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  test('returns all tasks ordered newest first', async () => {
    const first = await createTask({ title: 'First task', status: 'todo', priority: 'low' });
    // Small delay to ensure distinct createdAt timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = await createTask({ title: 'Second task', status: 'in-progress', priority: 'high' });

    const result = await listTasks();

    expect(result).toHaveLength(2);
    // Newest (second) should come first
    expect(new Date(result[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(result[1].createdAt).getTime(),
    );
    expect(result[0].id).toBe(second.id);
    expect(result[1].id).toBe(first.id);
  });

  test('each returned task has the correct shape and field types', async () => {
    await createTask({ title: 'Shape test task', status: 'done', priority: 'medium' });

    const result = await listTasks();

    expect(result).toHaveLength(1);
    const task = result[0];

    expect(typeof task.id).toBe('string');
    expect(typeof task.title).toBe('string');
    expect(['todo', 'in-progress', 'done']).toContain(task.status);
    expect(['low', 'medium', 'high']).toContain(task.priority);
    // ISO-8601 strings are parseable as valid dates
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
    expect(new Date(task.updatedAt).toISOString()).toBe(task.updatedAt);
  });
});
