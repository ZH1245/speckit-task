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
