import { Icon } from "@iconify/react";
import altArrowLeftLinear from "@iconify-icons/solar/alt-arrow-left-linear";
import altArrowRightLinear from "@iconify-icons/solar/alt-arrow-right-linear";
import Link from "next/link";
import { cn } from "@shared/lib/style-utils";

interface ArchivePaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function buildHref(basePath: string, page: number): string {
  const params = new URLSearchParams({ page: String(page) });

  return `${basePath}?${params.toString()}`;
}

function generatePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 1) {
    return [];
  }

  const windowSize = 1;
  const windowStart = Math.max(2, currentPage - windowSize);
  const windowEnd = Math.min(totalPages - 1, currentPage + windowSize);
  const pages: Array<number | "..."> = [1];

  if (windowStart > 2) {
    pages.push("...");
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    pages.push(page);
  }

  if (windowEnd < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}

const buttonClassName =
  "page-btn inline-flex h-9 w-9 items-center justify-center rounded-lg text-body-sm";

export function ArchivePagination({
  currentPage,
  totalPages,
  basePath,
}: ArchivePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevFive = currentPage > 5;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const hasNextFive = currentPage + 5 <= totalPages;
  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1 motion-reveal"
      aria-label="페이지 탐색"
      style={{ animationDelay: "200ms" }}
    >
      <PaginationArrow
        disabled={!hasPrevFive}
        href={
          hasPrevFive
            ? buildHref(basePath, Math.max(1, currentPage - 5))
            : undefined
        }
        ariaLabel="5페이지 이전으로"
        direction="left-double"
      />
      <PaginationArrow
        disabled={!hasPrev}
        href={hasPrev ? buildHref(basePath, currentPage - 1) : undefined}
        ariaLabel="이전 페이지"
        direction="left"
      />

      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className={cn(buttonClassName, "cursor-default text-text-3")}
            aria-hidden="true"
          >
            …
          </span>
        ) : page === currentPage ? (
          <span
            key={page}
            className={cn(
              buttonClassName,
              "bg-primary-1 font-bold text-background-1",
            )}
            aria-current="page"
            aria-label={`${page} 페이지`}
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(basePath, page)}
            className={cn(
              buttonClassName,
              "font-medium text-text-2 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.08] hover:bg-background-3 active:scale-95",
            )}
            aria-label={`${page} 페이지`}
          >
            {page}
          </Link>
        ),
      )}

      <PaginationArrow
        disabled={!hasNext}
        href={hasNext ? buildHref(basePath, currentPage + 1) : undefined}
        ariaLabel="다음 페이지"
        direction="right"
      />
      <PaginationArrow
        disabled={!hasNextFive}
        href={
          hasNextFive
            ? buildHref(basePath, Math.min(totalPages, currentPage + 5))
            : undefined
        }
        ariaLabel="5페이지 이후로"
        direction="right-double"
      />
    </nav>
  );
}

function PaginationArrow({
  disabled,
  href,
  ariaLabel,
  direction,
}: {
  disabled: boolean;
  href?: string;
  ariaLabel: string;
  direction: "left" | "left-double" | "right" | "right-double";
}) {
  const content =
    direction === "left-double" ? (
      <>
        <Icon icon={altArrowLeftLinear} width="16" aria-hidden="true" />
        <Icon
          icon={altArrowLeftLinear}
          width="16"
          aria-hidden="true"
          className="-ml-2"
        />
      </>
    ) : direction === "right-double" ? (
      <>
        <Icon icon={altArrowRightLinear} width="16" aria-hidden="true" />
        <Icon
          icon={altArrowRightLinear}
          width="16"
          aria-hidden="true"
          className="-ml-2"
        />
      </>
    ) : (
      <Icon
        icon={direction === "left" ? altArrowLeftLinear : altArrowRightLinear}
        width="16"
        aria-hidden="true"
      />
    );

  if (disabled || !href) {
    return (
      <span
        className={cn(
          buttonClassName,
          "cursor-not-allowed bg-transparent text-text-3 opacity-30",
        )}
        aria-disabled="true"
        aria-label={ariaLabel}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        buttonClassName,
        "bg-transparent text-text-3 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.08] hover:bg-background-3 active:scale-95",
      )}
      aria-label={ariaLabel}
    >
      {content}
    </Link>
  );
}
