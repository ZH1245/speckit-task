'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';

import type { TaskStatus } from '@/types/task';
import styles from './TaskList.module.css';

interface StatusSelectProps {
  value: TaskStatus;
  onChange: (newStatus: TaskStatus) => Promise<void>;
}

const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as TaskStatus;
    setSaving(true);
    try {
      await onChange(newStatus);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      className={styles.select}
      value={value}
      onChange={handleChange}
      disabled={saving}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
