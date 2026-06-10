import { cn } from "../../utils";
import type { ReactNode } from "react";

interface StatusBadgeProps {
  label: string;
  className?: string;
  children?: ReactNode;
}

export function StatusBadge({ label, className, children }: StatusBadgeProps) {
  return (
    <span className={cn("tag-gallery border", className)}>
      {children}
      {label}
    </span>
  );
}
