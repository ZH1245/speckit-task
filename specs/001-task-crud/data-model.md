# Data Model: Task CRUD

**Feature**: Task CRUD (`001-task-crud`)
**Date**: 2026-06-21

---

## Entity: Task

The single entity in this feature. Stored in a `tasks` table in PostgreSQL.

### Fields

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY, default `gen_random_uuid()` | System-assigned; never set by caller |
| `title` | `varchar(255)` | NOT NULL, length 1–255 | Required; empty string rejected at API boundary |
| `status` | `text` (enum) | NOT NULL, default `'todo'` | One of: `todo`, `in-progress`, `done` |
| `priority` | `text` (enum) | NOT NULL, default `'medium'` | One of: `low`, `medium`, `high` |
| `createdAt` | `timestamp with time zone` | NOT NULL, default `now()` | System-assigned; never set by caller |
| `updatedAt` | `timestamp with time zone` | NOT NULL, default `now()` | Updated automatically on every write |

### Drizzle Schema (reference — implementation detail for tasks phase)

```ts
// db/schema.ts
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id:        uuid('id').primaryKey().defaultRandom(),
  title:     varchar('title', { length: 255 }).notNull(),
  status:    text('status').notNull().default('todo'),
  priority:  text('priority').notNull().default('medium'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### Validation Rules (enforced at API boundary via Zod)

| Field | Rule |
|---|---|
| `title` | Required string; min length 1; max length 255 |
| `status` | Must be one of: `todo`, `in-progress`, `done` |
| `priority` | Must be one of: `low`, `medium`, `high` |
| `id`, `createdAt`, `updatedAt` | Read-only — rejected if present in POST/PATCH body |

### Status Transitions

No enforced state-machine for this demo. Any `status` value can transition to any other. The allowed set is: `todo` → `in-progress` → `done` (and back).

### Default Ordering

Tasks are returned sorted by `createdAt DESC` (newest first) in the list endpoint.

---

## TypeScript Type (canonical — lives in `types/task.ts`)

```ts
/** Allowed status values for a task. */
export type TaskStatus = 'todo' | 'in-progress' | 'done';

/** Allowed priority levels for a task. */
export type TaskPriority = 'low' | 'medium' | 'high';

/** A task as stored in the database and returned by the API. */
export interface Task {
  /** System-assigned UUID. Never set by callers. */
  id: string;
  /** Short description of the work. 1–255 characters. */
  title: string;
  /** Current state of the task. */
  status: TaskStatus;
  /** Relative importance of the task. */
  priority: TaskPriority;
  /** ISO-8601 timestamp of creation. System-assigned. */
  createdAt: string;
  /** ISO-8601 timestamp of last modification. System-managed. */
  updatedAt: string;
}

/** Fields accepted when creating a task via POST /api/tasks. */
export interface CreateTaskInput {
  /** Required. 1–255 characters. */
  title: string;
  /** Defaults to 'todo' if omitted. */
  status?: TaskStatus;
  /** Defaults to 'medium' if omitted. */
  priority?: TaskPriority;
}

/** Fields accepted when updating a task via PATCH /api/tasks/[id]. */
export interface UpdateTaskInput {
  /** If provided: 1–255 characters. */
  title?: string;
  /** If provided: must be a valid TaskStatus value. */
  status?: TaskStatus;
  /** If provided: must be a valid TaskPriority value. */
  priority?: TaskPriority;
}
```
