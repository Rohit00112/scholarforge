import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "tech" | "status-draft" | "status-published" | "status-deployed" | "status-archived" | "category";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variant === "tech" && "border-line bg-ink-900 font-mono text-[0.6875rem] tracking-wide text-muted",
        variant === "default" && "border-line bg-ink-800 text-paper",
        variant === "category" && "border-brass/30 bg-brass/10 text-brass",
        variant === "status-draft" && "border-line bg-ink-800 text-muted",
        variant === "status-published" && "border-brass/30 bg-brass/10 text-brass",
        variant === "status-deployed" && "border-live/30 bg-live/10 text-live",
        variant === "status-archived" && "border-clay/30 bg-clay/10 text-clay",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: "Draft",
    published: "Published",
    deployed: "Live",
    archived: "Archived",
  };
  return (
    <Badge variant={`status-${status}` as BadgeProps["variant"]}>
      {labels[status] ?? status}
    </Badge>
  );
}