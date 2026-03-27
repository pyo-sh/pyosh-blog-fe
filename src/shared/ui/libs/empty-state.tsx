import { type ReactNode } from "react";
import { cn } from "@shared/lib/style-utils";

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  /** "default" matches admin-page style; "page" matches public-page style */
  variant?: "default" | "page";
  className?: string;
}

const variantClasses: Record<NonNullable<EmptyStateProps["variant"]>, string> =
  {
    default:
      "rounded-[1.5rem] border border-dashed border-border-3 bg-background-1 px-6 py-12 text-center",
    page: "rounded-[2rem] border border-dashed border-border-3 bg-background-2 p-8 text-body-md md:p-10",
  };

export function EmptyState({
  icon,
  message,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(variantClasses[variant], className)}>
      {icon ? (
        <div className="mb-3 flex justify-center text-text-3">{icon}</div>
      ) : null}
      <p className="text-text-3">{message}</p>
    </div>
  );
}
