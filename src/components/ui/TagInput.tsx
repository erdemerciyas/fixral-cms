'use client';

import React, { useState } from 'react';

interface TagInputProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ label, values, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (values.includes(tag)) {
      setInput('');
      return;
    }
    onChange([...values, tag]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(values.filter((t) => t !== tag));
  }

  return (
    <div className="w-full">
      {label && <label className="label-text">{label}</label>}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border px-2 py-2 bg-card">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted text-foreground">
            {v}
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => removeTag(v)}>×</button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[120px] outline-hidden text-sm py-1"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(input);
            }
            if (e.key === 'Backspace' && !input && values.length > 0) {
              removeTag(values[values.length - 1]);
            }
          }}
          onBlur={() => addTag(input)}
        />
      </div>
    </div>
  );
}


