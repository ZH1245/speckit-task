'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import type { TaskStatus, TaskPriority } from '@/types/task';
import styles from './CreateTaskForm.module.css';

const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];
const priorities: TaskPriority[] = ['low', 'medium', 'high'];

/**
 * Form for creating a task via POST /api/tasks.
 * Refreshes the server-rendered list on success.
 */
export default function CreateTaskForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (title.trim() === '') {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), status, priority }),
    });

    if (response.ok) {
      setTitle('');
      setStatus('todo');
      setPriority('medium');
      router.refresh();
    } else {
      const body: { error?: string } = await response.json().catch(() => ({}));
      setError(body.error ?? 'Failed to create task.');
    }
    setSubmitting(false);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.titleInput}
        placeholder="New task title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={255}
        disabled={submitting}
      />
      <select
        className={styles.select}
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
        disabled={submitting}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className={styles.select}
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        disabled={submitting}
      >
        {priorities.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add task'}
      </button>
      {error !== null && <p className={styles.error}>{error}</p>}
    </form>
  );
}
