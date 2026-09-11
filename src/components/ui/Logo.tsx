import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-6 w-6", className)}
    >
      <path
        d="M16 2.5 28.5 9.25v13.5L16 29.5 3.5 22.75V9.25Z"
        stroke="#C9A45C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.2 18.05 13.95 22.8 16 18.05 18.05 16 22.8 13.95 18.05 9.2 16 13.95 13.95Z"
        fill="#E2C577"
      />
    </svg>
  );
}