import { type ReactNode } from "react";
import { cn } from "@shared/lib/style-utils";

interface EmptyStateProps {
  icon?: ReactNode;
  message?: string;
  title?: string;
  description?: string;
  /** "default" matches admin-page style; "page" matches public-page style */
  variant?: "default" | "page";
  className?: string;
}

const variantClasses: Record<
  NonNullable<EmptyStateProps["variant"]>,
  string
> = {
  default:
    "rounded-[1.5rem] border border-dashed border-border-3 bg-background-1 px-6 py-12 text-center text-sm",
  page: "rounded-[2rem] border-2 border-dashed border-border-3 bg-background-2 px-8 py-16 text-center text-body-md",
};

export function EmptyState({
  icon,
  message,
  title,
  description,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(variantClasses[variant], className)}>
      {icon ? (
        <div className="mb-4 flex justify-center text-text-3">{icon}</div>
      ) : null}
      {title ? (
        <p className="mb-1 break-keep text-base font-medium text-text-2">
          {title}
        </p>
      ) : null}
      {description ? (
        <p className="text-body-sm text-text-4">{description}</p>
      ) : null}
      {!title && message ? <p className="text-text-3">{message}</p> : null}
    </div>
  );
}
