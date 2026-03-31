import { type ReactNode } from "react";
import { Icon } from "@iconify/react";
import dangerTriangleLinear from "@iconify-icons/solar/danger-triangle-linear";
import linkMinimalistic2Linear from "@iconify-icons/solar/link-minimalistic-2-linear";
import refreshLinear from "@iconify-icons/solar/refresh-linear";
import Link from "next/link";
import { cn } from "@shared/lib/style-utils";

type ErrorAction =
  | { type: "link"; href: string; label: string }
  | { type: "button"; onClick: () => void; label: string };

interface ErrorContentProps {
  badge: string;
  badgeVariant: "primary" | "negative";
  title: string;
  description: string;
  action: ErrorAction;
  context?: "public" | "admin";
  eyebrow?: string;
  icon?: ReactNode;
  className?: string;
}

export function ErrorContent({
  badge,
  badgeVariant,
  title,
  description,
  action,
  context = "public",
  eyebrow,
  icon,
  className,
}: ErrorContentProps) {
  const badgeClasses =
    badgeVariant === "primary"
      ? "border-primary-1/20 bg-primary-1/10 text-primary-1"
      : "border-negative-1/20 bg-negative-1/10 text-negative-1";

  const iconRingClasses =
    badgeVariant === "primary"
      ? "border-primary-1/20 bg-background-1 text-primary-1"
      : "border-negative-1/20 bg-background-1 text-negative-1";

  const surfaceClasses =
    context === "admin"
      ? "max-w-[36rem] rounded-[1.75rem] border border-border-3 bg-background-2/90 p-7 text-left shadow-[0_18px_48px_rgba(0,0,0,0.08)] md:p-8"
      : "max-w-[38rem] rounded-[2rem] border border-border-3 bg-background-2/90 p-8 text-left shadow-[0_22px_60px_rgba(0,0,0,0.08)] md:p-10";

  return (
    <div
      className={cn(
        "w-full overflow-hidden",
        surfaceClasses,
        "motion-reveal",
        className,
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
            iconRingClasses,
          )}
          aria-hidden="true"
        >
          {icon ?? (
            <Icon
              icon={dangerTriangleLinear}
              width="20"
              className="shrink-0"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "mb-3 inline-flex items-center rounded-md border px-3 py-1 text-ui-sm font-bold tracking-[0.03em]",
              badgeClasses,
            )}
          >
            {badge}
          </div>

          {eyebrow ? (
            <p className="mb-2 text-ui-xs font-bold uppercase tracking-[0.08em] text-text-4">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="break-keep text-[1.5rem] leading-[1.95rem] font-bold tracking-tight text-text-1 md:text-[1.875rem] md:leading-[2.375rem]">
            {title}
          </h1>

          <p className="mt-3 break-keep text-body-sm leading-relaxed text-text-3 md:text-body-base">
            {description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {action.type === "link" ? (
              <Link
                href={action.href}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-1 px-5 py-2.5 text-ui-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/35"
              >
                <Icon
                  icon={linkMinimalistic2Linear}
                  width="16"
                  aria-hidden="true"
                />
                {action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-ui-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2",
                  badgeVariant === "negative"
                    ? "bg-negative-1 text-white focus-visible:ring-negative-1/35"
                    : "bg-primary-1 text-white focus-visible:ring-primary-1/35",
                )}
              >
                <Icon icon={refreshLinear} width="16" aria-hidden="true" />
                {action.label}
              </button>
            )}

            <span className="text-ui-xs text-text-4">
              {context === "admin"
                ? "관리 화면 문맥에서 동일한 상태 시스템을 사용합니다."
                : "퍼블릭 화면 문맥에서 동일한 상태 시스템을 사용합니다."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
