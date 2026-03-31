import { type ReactNode } from "react";
import { cn } from "@shared/lib/style-utils";

interface EmptyStateProps {
  icon?: ReactNode;
  message?: string;
  title?: string;
  description?: string;
  /** "default" matches section/admin style; "page" matches public page style; "admin-page" matches manage screens */
  variant?: "default" | "page" | "admin-page";
  className?: string;
}

const variantClasses: Record<
  NonNullable<EmptyStateProps["variant"]>,
  string
> = {
  default:
    "rounded-[1.5rem] border border-dashed border-border-3 bg-background-1 px-6 py-12 text-center text-sm",
  page: "rounded-[2rem] border border-border-3 bg-background-2/90 px-8 py-14 text-center shadow-[0_16px_48px_rgba(0,0,0,0.06)]",
  "admin-page":
    "rounded-[1.75rem] border border-border-3 bg-background-2/90 px-8 py-14 text-center shadow-[0_16px_48px_rgba(0,0,0,0.06)]",
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
    <div className={cn(variantClasses[variant], "motion-reveal", className)}>
      {icon ? (
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-3 bg-background-1 text-text-3">
            {icon}
          </div>
        </div>
      ) : null}
      {title ? (
        <p className="mb-2 break-keep text-base font-bold tracking-tight text-text-1 md:text-[1.125rem]">
          {title}
        </p>
      ) : null}
      {description ? (
        <p className="mx-auto max-w-[32rem] break-keep text-body-sm leading-relaxed text-text-3">
          {description}
        </p>
      ) : null}
      {!title && message ? (
        <p className="mx-auto max-w-[28rem] break-keep text-body-sm leading-relaxed text-text-3">
          {message}
        </p>
      ) : null}
    </div>
  );
}
