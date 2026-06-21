import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';

/** Maps a database row to the public Task shape (snake_case → camelCase, dates to ISO strings). */
function rowToTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Returns all tasks ordered newest first.
 * Only call from server-side code (route handlers or Server Components).
 */
export async function listTasks(): Promise<Task[]> {
  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return rows.map(rowToTask);
}

/**
 * Creates a new task and returns it.
 * @param input - Validated task creation fields.
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const [row] = await db
    .insert(tasks)
    .values({
      title: input.title,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
    })
    .returning();
  return rowToTask(row);
}

/**
 * Updates a task by id and returns the updated task.
 * Returns null if no task with that id exists.
 * @param id - UUID of the task to update.
 * @param input - Partial fields to update (at least one required).
 */
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const [row] = await db
    .update(tasks)
    .set({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning();
  return row ? rowToTask(row) : null;
}

/**
 * Deletes a task by id.
 * Returns true if a row was deleted, false if no task with that id existed.
 * @param id - UUID of the task to delete.
 */
export async function deleteTask(id: string): Promise<boolean> {
  const [row] = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
  return row !== undefined;
}
