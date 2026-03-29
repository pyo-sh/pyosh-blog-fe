import Link from "next/link";
import { formatNumber } from "@shared/lib/format-number";
import { cn } from "@shared/lib/style-utils";

interface ArchiveBreadcrumbItem {
  label: string;
  href?: string;
}

interface ArchiveHeaderProps {
  label?: string;
  title: string;
  count: number;
  countLabel: string;
  breadcrumbs?: ArchiveBreadcrumbItem[];
  titlePrefix?: string;
  className?: string;
}

export function ArchiveHeader({
  label,
  title,
  count,
  countLabel,
  breadcrumbs,
  titlePrefix,
  className,
}: ArchiveHeaderProps) {
  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0);

  return (
    <header className={cn("motion-reveal pt-7", className)}>
      {label ? (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-[0.688rem] font-bold uppercase tracking-[0.18em] text-text-4">
            {label}
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
                aria-label="현재 위치"
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
                          className="transition-colors hover:text-text-3 hover:underline hover:underline-offset-4"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className={isLast ? "text-text-3" : undefined}>
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
      ) : null}

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="break-keep text-[2.25rem] leading-[1.1] font-bold tracking-[-0.025em] text-text-1 sm:text-[2.875rem]">
          {titlePrefix ? (
            <span className="text-primary-1">{titlePrefix}</span>
          ) : null}
          {title}
        </h1>
        <span className="text-body-sm text-text-4">
          총 {formatNumber(count)}
          {countLabel}
        </span>
      </div>

      <div className="mt-6 mb-8 h-px bg-border-4" />
    </header>
  );
}

function BreadcrumbChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="mx-px h-2.5 w-2.5 shrink-0 text-text-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 3 4 5-4 5" />
    </svg>
  );
}
