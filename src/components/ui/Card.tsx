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
        "rounded-xl border border-[#1F2937] bg-[#121826] p-4",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6366F1]/40 hover:shadow-lg hover:shadow-[#6366F1]/5",
        className
      )}
    >
      {children}
    </div>
  );
}
