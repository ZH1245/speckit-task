'use client';

import React, { useState } from 'react';
import type { CSSProperties } from 'react';

import type { TaskPriority } from '@/types/task';

interface PrioritySelectProps {
  value: TaskPriority;
  onChange: (newPriority: TaskPriority) => Promise<void>;
}

const selectStyle: CSSProperties = {
  font: 'inherit',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

const priorities: TaskPriority[] = ['low', 'medium', 'high'];

export default function PrioritySelect({ value, onChange }: PrioritySelectProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
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
      style={selectStyle}
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
