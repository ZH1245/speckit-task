'use client';

import React, { useState } from 'react';
import type { CSSProperties } from 'react';

import type { TaskStatus } from '@/types/task';

interface StatusSelectProps {
  value: TaskStatus;
  onChange: (newStatus: TaskStatus) => Promise<void>;
}

const selectStyle: CSSProperties = {
  font: 'inherit',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
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
      style={selectStyle}
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
