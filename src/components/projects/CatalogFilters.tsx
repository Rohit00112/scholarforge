"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CATEGORY_LABELS, PROJECT_CATEGORIES } from "@/lib/constants";

export function CatalogFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const set = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.push(`/projects?${next.toString()}`, { scroll: false });
    },
    [router, sp],
  );

  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const tech = sp.get("tech") ?? "";
  const sort = sp.get("sort") ?? "newest";
  const status = sp.get("status") ?? "";
  const looking = sp.get("looking") ?? "";

  return (
    <div className="space-y-4">
      <Input
        name="q"
        placeholder="Search projects..."
        value={q}
        onChange={(e) => set("q", e.target.value)}
      />

      <div>
        <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">Status</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "" },
            { label: "Live", value: "deployed" },
            { label: "Published", value: "published" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set("status", opt.value || null)}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                status === opt.value
                  ? "border-brass bg-brass/15 text-brass"
                  : "border-line bg-ink-800 text-muted hover:border-brass/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">Category</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => set("category", null)}
            className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
              !category
                ? "border-brass bg-brass/15 text-brass"
                : "border-line bg-ink-800 text-muted hover:border-brass/40"
            }`}
          >
            All
          </button>
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => set("category", category === cat ? null : cat)}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                category === cat
                  ? "border-brass bg-brass/15 text-brass"
                  : "border-line bg-ink-800 text-muted hover:border-brass/40"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <Input
        name="tech"
        placeholder="Filter by tech (comma-separated, e.g. python,tensorflow)"
        value={tech}
        onChange={(e) => set("tech", e.target.value)}
      />

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">Sort</p>
          <Select name="sort" value={sort} onChange={(e) => set("sort", e.target.value === "newest" ? null : e.target.value)}>
            <option value="newest">Newest</option>
            <option value="stars">Most starred</option>
            <option value="forks">Most forks</option>
          </Select>
        </div>
        <div>
          <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">Contributors</p>
          <button
            onClick={() => set("looking", looking ? null : "1")}
            className={`rounded-md border px-3 py-2 text-xs transition-colors ${
              looking
                ? "border-brass bg-brass/15 text-brass"
                : "border-line bg-ink-800 text-muted hover:border-brass/40"
            }`}
          >
            Looking for contributors
          </button>
        </div>
      </div>
    </div>
  );
}