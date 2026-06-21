/**
 * Integration tests for task creation (T015, T016).
 *
 * These tests call lib/tasks.ts#createTask directly against a real PostgreSQL
 * database. No mocks. DATABASE_URL must be set in the environment.
 *
 * T016 (route-level 400 validation) is a todo placeholder — it will be wired
 * once the POST /api/tasks route exists.
 */

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { createTask } from '@/lib/tasks';

beforeEach(async () => {
  // Truncate the tasks table before each test to ensure isolation.
  await db.execute(sql`TRUNCATE TABLE ${tasks} RESTART IDENTITY CASCADE`);
});

describe('createTask (lib/tasks.ts)', () => {
  // T015 — valid minimal body returns a well-formed task object
  test('T015: createTask with title only returns task with default status and priority', async () => {
    const task = await createTask({ title: 'Test task' });

    // id must be a UUID string
    expect(typeof task.id).toBe('string');
    expect(task.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    expect(task.title).toBe('Test task');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');

    // dates must be ISO 8601 strings
    expect(typeof task.createdAt).toBe('string');
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
    expect(typeof task.updatedAt).toBe('string');
    expect(new Date(task.updatedAt).toISOString()).toBe(task.updatedAt);
  });

  // T015b — explicit status and priority are persisted correctly
  test('T015b: createTask with all fields returns task with supplied status and priority', async () => {
    const task = await createTask({
      title: 'Buy milk',
      status: 'in-progress',
      priority: 'high',
    });

    expect(task.title).toBe('Buy milk');
    expect(task.status).toBe('in-progress');
    expect(task.priority).toBe('high');

    // id and dates must still be well-formed
    expect(task.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
    expect(new Date(task.updatedAt).toISOString()).toBe(task.updatedAt);
  });
});

describe('POST /api/tasks — route-level validation', () => {
  // T016 — empty-title → 400 is enforced at the route layer, not in lib/tasks.ts.
  // This placeholder will be replaced with a real HTTP-level test (e.g. via
  // next-test-api-route-handler or a running dev server) once the route exists.
  test.todo(
    'POST /api/tasks missing title returns 400 — wired once route exists',
  );
});
