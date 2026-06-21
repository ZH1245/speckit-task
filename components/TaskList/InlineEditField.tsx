'use client';

import { useState, useRef, useEffect, KeyboardEvent, CSSProperties } from 'react';

interface InlineEditFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
}

const textStyle: CSSProperties = {
  cursor: 'text',
  minHeight: '1em',
  display: 'inline-block',
};

const inputStyle: CSSProperties = {
  font: 'inherit',
  padding: '0',
  border: 'none',
  borderBottom: '1px solid currentColor',
  outline: 'none',
  background: 'transparent',
  width: '100%',
};

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
        style={inputStyle}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <span style={textStyle} onClick={startEdit}>
      {value}
    </span>
  );
}
