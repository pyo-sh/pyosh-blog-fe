import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-border-3 bg-background-1 px-6 py-12 text-center">
      {icon ? (
        <div className="mb-3 flex justify-center text-text-3">{icon}</div>
      ) : null}
      <p className="text-sm text-text-3">{message}</p>
    </div>
  );
}
