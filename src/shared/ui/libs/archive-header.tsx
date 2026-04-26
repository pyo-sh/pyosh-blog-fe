import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import altArrowRightLinear from "@iconify-icons/solar/alt-arrow-right-linear";
import Link from "next/link";
import { formatNumber } from "@shared/lib/format-number";
import { cn } from "@shared/lib/style-utils";

interface ArchiveBreadcrumbItem {
  label: string;
  href?: string;
}

interface ArchiveHeaderProps {
  variant: "category" | "tag";
  title: string;
  count?: number;
  summary?: ReactNode;
  breadcrumbs?: ArchiveBreadcrumbItem[];
  className?: string;
  eyebrow?: string;
}

export function ArchiveHeader({
  variant,
  title,
  count,
  summary,
  breadcrumbs,
  className,
  eyebrow,
}: ArchiveHeaderProps) {
  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0);
  const resolvedEyebrow =
    eyebrow ?? (variant === "category" ? "Category Archive" : "Tag Archive");
  const resolvedSummary =
    summary ??
    (count === undefined ? null : `총 ${formatNumber(count)}개의 글`);

  return (
    <header className={cn("mb-8 w-full min-w-0 motion-reveal", className)}>
      {variant === "category" ? (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-body-xs font-bold uppercase tracking-[0.18em] text-text-4">
            {resolvedEyebrow}
          </span>
          {hasBreadcrumbs ? (
            <>
              <span
                aria-hidden="true"
                className="text-[0.75rem] leading-none text-border-3"
              >
                ·
              </span>
              <nav
                aria-label="카테고리 경로"
                className="flex flex-wrap items-center gap-1 text-ui-xs text-text-4"
              >
                {breadcrumbs?.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <span key={`${item.label}-${index}`} className="contents">
                      {index > 0 ? <BreadcrumbChevron /> : null}
                      {item.href && !isLast ? (
                        <Link
                          href={item.href}
                          className="text-text-4 transition-colors hover:underline hover:underline-offset-4"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className={isLast ? "text-text-3" : "text-text-4"}
                        >
                          {item.label}
                        </span>
                      )}
                    </span>
                  );
                })}
              </nav>
            </>
          ) : null}
        </div>
      ) : (
        <div className="mb-5">
          <span className="text-body-xs font-bold uppercase tracking-[0.18em] text-text-4">
            {resolvedEyebrow}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="min-w-0 flex-1 break-keep text-[2.25rem] leading-[1.1] font-bold tracking-[-0.025em] text-text-1 sm:text-[2.875rem]">
          {variant === "tag" ? <span className="text-primary-1">#</span> : null}
          {title}
        </h1>
        {resolvedSummary ? (
          <span className="shrink-0 whitespace-nowrap text-body-sm text-text-4">
            {resolvedSummary}
          </span>
        ) : null}
      </div>

      <div className="mt-6 h-px bg-border-4" />
    </header>
  );
}

function BreadcrumbChevron() {
  return (
    <span
      aria-hidden="true"
      className="mx-px inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center text-text-4"
    >
      <Icon icon={altArrowRightLinear} width="10" aria-hidden="true" />
    </span>
  );
}
