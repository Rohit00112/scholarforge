import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#6366F1] text-white hover:bg-[#4F46E5] active:scale-[0.98]": variant === "primary",
            "border border-[#1F2937] bg-[#121826] text-[#E5E7EB] hover:border-[#6366F1]/40 hover:bg-[#1a2035]": variant === "secondary",
            "text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#121826]": variant === "ghost",
            "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-900/40": variant === "danger",
          },
          {
            "h-7 px-3 text-xs": size === "sm",
            "h-9 px-4 text-sm": size === "md",
            "h-11 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
