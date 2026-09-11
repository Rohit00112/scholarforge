"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy link to this project"
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium text-muted transition-colors hover:border-brass/50 hover:text-paper"
    >
      {copied ? <Check className="h-4 w-4 text-live" /> : <Link2 className="h-4 w-4" />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}