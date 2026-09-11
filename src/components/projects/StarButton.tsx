"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarButtonProps {
  slug: string;
  initialStarred: boolean;
  initialCount: number;
  authenticated: boolean;
}

export function StarButton({ slug, initialStarred, initialCount, authenticated }: StarButtonProps) {
  const router = useRouter();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const callbackUrl = encodeURIComponent(`/projects/${slug}`);

  if (!authenticated) {
    return (
      <Link
        href={`/login?callbackUrl=${callbackUrl}`}
        title="Sign in with your college email to star this."
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium text-muted transition-colors hover:border-brass/50 hover:text-paper"
      >
        <Star className="h-4 w-4" />
        Star
        <span className="font-mono text-xs">{count}</span>
      </Link>
    );
  }

  async function toggle() {
    if (pending) return;
    setPending(true);
    const previous = { starred, count };
    setStarred(!starred);
    setCount(count + (starred ? -1 : 1));
    try {
      const res = await fetch(`/api/v1/projects/${slug}/star`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/login?callbackUrl=${callbackUrl}`);
        return;
      }
      if (!res.ok) throw new Error("Star request failed");
      const data = (await res.json()) as { starred: boolean; starsCount: number };
      setStarred(data.starred);
      setCount(data.starsCount);
    } catch {
      setStarred(previous.starred);
      setCount(previous.count);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={starred}
      disabled={pending}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-all",
        starred
          ? "border-brass/60 bg-brass/15 text-brass"
          : "border-line bg-surface text-paper hover:border-brass/50 hover:bg-ink-700"
      )}
    >
      <Star className={cn("h-4 w-4", starred && "fill-brass")} />
      {starred ? "Starred" : "Star"}
      <span className="font-mono text-xs">{count}</span>
    </button>
  );
}