/**
 * Integration tests for task deletion (T033, T034).
 *
 * These tests call lib/tasks.ts#deleteTask directly against a real PostgreSQL
 * database. No mocks. DATABASE_URL must be set in the environment.
 */

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { createTask, deleteTask, listTasks } from '@/lib/tasks';

beforeEach(async () => {
  // Truncate the tasks table before each test to ensure isolation.
  await db.execute(sql`TRUNCATE TABLE ${tasks} RESTART IDENTITY CASCADE`);
});

describe('deleteTask (lib/tasks.ts)', () => {
  // T033 — deleting an existing task returns true and task is removed from list
  test('T033: deleteTask with existing id returns true and task no longer appears in listTasks', async () => {
    const created = await createTask({ title: 'Task to delete' });
    const result = await deleteTask(created.id);

    expect(result).toBe(true);

    const remaining = await listTasks();
    expect(remaining).toHaveLength(0);
  });

  // T034 — deleting a non-existent id returns false (does not throw)
  test('T034: deleteTask with non-existent id returns false', async () => {
    const result = await deleteTask('00000000-0000-0000-0000-000000000000');
    expect(result).toBe(false);
  });
});
