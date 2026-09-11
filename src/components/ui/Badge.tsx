import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "tech" | "status-draft" | "status-published" | "status-deployed" | "status-archived" | "category";
  className?: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-zinc-800 text-zinc-400 border-zinc-700",
  published: "bg-indigo-950 text-indigo-400 border-indigo-800",
  deployed: "bg-emerald-950 text-emerald-400 border-emerald-800",
  archived: "bg-amber-950 text-amber-400 border-amber-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variant === "tech" && "border-[#1F2937] bg-[#0B0F19] text-[#9CA3AF]",
        variant === "default" && "border-[#1F2937] bg-[#121826] text-[#E5E7EB]",
        variant === "category" && "border-[#6366F1]/30 bg-[#6366F1]/10 text-[#818CF8]",
        variant === "status-draft" && statusColors.draft,
        variant === "status-published" && statusColors.published,
        variant === "status-deployed" && statusColors.deployed,
        variant === "status-archived" && statusColors.archived,
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
