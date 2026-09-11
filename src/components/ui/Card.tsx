import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface p-4 shadow-[inset_0_1px_0_0_rgba(232,230,223,0.025)]",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-[0_14px_36px_-18px_rgba(201,164,92,0.35),inset_0_1px_0_0_rgba(232,230,223,0.025)]",
        className
      )}
    >
      {children}
    </div>
  );
}