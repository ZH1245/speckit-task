/**
 * Integration tests for task update (T025, T026).
 *
 * These tests call lib/tasks.ts#updateTask directly against a real PostgreSQL
 * database. No mocks. DATABASE_URL must be set in the environment.
 *
 * T027 (updateTaskSchema) is verified in lib/validators/task.ts — all fields
 * optional with .refine() requiring at least one field.
 */

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { createTask, updateTask } from '@/lib/tasks';

beforeEach(async () => {
  // Truncate the tasks table before each test to ensure isolation.
  await db.execute(sql`TRUNCATE TABLE ${tasks} RESTART IDENTITY CASCADE`);
});

describe('updateTask (lib/tasks.ts)', () => {
  // T025a — valid partial update (title only) returns updated task
  test('T025a: updateTask with title returns task with updated title and unchanged id', async () => {
    const created = await createTask({ title: 'Original title' });
    const updated = await updateTask(created.id, { title: 'Updated' });

    expect(updated).not.toBeNull();
    expect(updated!.id).toBe(created.id);
    expect(updated!.title).toBe('Updated');
    // dates must be ISO 8601 strings
    expect(typeof updated!.updatedAt).toBe('string');
    expect(new Date(updated!.updatedAt).toISOString()).toBe(updated!.updatedAt);
  });

  // T025b — valid partial update (status + priority) returns task with both fields updated
  test('T025b: updateTask with status and priority returns task with updated status and priority', async () => {
    const created = await createTask({ title: 'Multi-field update' });
    const updated = await updateTask(created.id, { status: 'done', priority: 'high' });

    expect(updated).not.toBeNull();
    expect(updated!.id).toBe(created.id);
    expect(updated!.title).toBe('Multi-field update');
    expect(updated!.status).toBe('done');
    expect(updated!.priority).toBe('high');
    expect(new Date(updated!.updatedAt).toISOString()).toBe(updated!.updatedAt);
  });

  // T026 — non-existent id returns null (does not throw)
  test('T026: updateTask with non-existent id returns null', async () => {
    const result = await updateTask('00000000-0000-0000-0000-000000000000', { title: 'X' });
    expect(result).toBeNull();
  });
});
