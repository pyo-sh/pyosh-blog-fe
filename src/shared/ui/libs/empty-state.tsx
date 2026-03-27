import { type ReactNode } from "react";
import { cn } from "@shared/lib/style-utils";

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  className?: string;
}

export function EmptyState({ icon, message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-dashed border-border-3 bg-background-1 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-3 flex justify-center text-text-3">{icon}</div>
      ) : null}
      <p className="text-sm text-text-3">{message}</p>
    </div>
  );
}
