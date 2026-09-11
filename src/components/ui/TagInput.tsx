"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  max?: number;
  error?: string;
}

export function TagInput({ label, values, onChange, placeholder, max = 15, error }: TagInputProps) {
  const [input, setInput] = useState("");

  const commit = () => {
    const val = input.trim().toLowerCase();
    if (val && !values.includes(val) && values.length < max) {
      onChange([...values, val]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
  };

  const remove = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <div className="text-[0.8125rem] font-medium text-paper">{label}</div>}
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface p-2 focus-within:border-brass/60 focus-within:ring-1 focus-within:ring-brass/30",
          error && "border-danger"
        )}
      >
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-xs text-paper"
          >
            {tag}
            <button type="button" onClick={() => remove(tag)} className="text-muted hover:text-clay" aria-label={`Remove ${tag}`}>
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-paper placeholder:text-muted focus:outline-none"
          placeholder={placeholder}
          aria-label={label}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}