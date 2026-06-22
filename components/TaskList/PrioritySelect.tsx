'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';

import type { TaskPriority } from '@/types/task';
import styles from './TaskList.module.css';

interface PrioritySelectProps {
  value: TaskPriority;
  onChange: (newPriority: TaskPriority) => Promise<void>;
}

const priorities: TaskPriority[] = ['low', 'medium', 'high'];

export default function PrioritySelect({ value, onChange }: PrioritySelectProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const newPriority = e.target.value as TaskPriority;
    setSaving(true);
    try {
      await onChange(newPriority);
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
      {priorities.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}
