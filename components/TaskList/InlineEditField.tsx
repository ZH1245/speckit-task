'use client';

import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';

import styles from './TaskList.module.css';

interface InlineEditFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
}

export default function InlineEditField({ value, onSave }: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  function startEdit() {
    setDraft(value);
    setIsEditing(true);
  }

  async function commitEdit() {
    setIsEditing(false);
    if (draft !== value) {
      await onSave(draft);
    }
  }

  function cancelEdit() {
    setDraft(value);
    setIsEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className={styles.inlineInput}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <span className={styles.inlineText} onClick={startEdit}>
      {value}
    </span>
  );
}
