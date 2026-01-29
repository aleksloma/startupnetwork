import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  color?: string;
  variant?: "solid" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, color, variant = "solid", size = "sm", className }: BadgeProps) {
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  if (variant === "outline") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium border-2",
          sizes[size],
          className
        )}
        style={{
          borderColor: color || "#6366F1",
          color: color || "#6366F1",
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium text-white",
        sizes[size],
        className
      )}
      style={{ backgroundColor: color || "#6366F1" }}
    >
      {children}
    </span>
  );
}
