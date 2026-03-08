import Link from "next/link";
import { cn } from "@shared/lib/style-utils";

interface IPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string>;
}

function buildHref(
  basePath: string,
  page: number,
  queryParams?: Record<string, string>,
): string {
  const params = new URLSearchParams({ ...queryParams, page: String(page) });
  return `${basePath}?${params.toString()}`;
}

function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams,
}: IPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      {hasPrev ? (
        <Link
          href={buildHref(basePath, currentPage - 1, queryParams)}
          className={cn(
            "inline-flex items-center justify-center px-3 py-1.5 rounded text-sm",
            "text-foreground-1 hover:bg-background-2 transition-colors",
          )}
          aria-label="Previous page"
        >
          &laquo;
        </Link>
      ) : (
        <span
          className="inline-flex items-center justify-center px-3 py-1.5 rounded text-sm text-foreground-3 cursor-not-allowed"
          aria-disabled="true"
          aria-label="Previous page"
        >
          &laquo;
        </span>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, page, queryParams)}
          className={cn(
            "inline-flex items-center justify-center px-3 py-1.5 rounded text-sm transition-colors",
            page === currentPage
              ? "bg-primary-1 text-text-1 font-semibold pointer-events-none"
              : "text-foreground-1 hover:bg-background-2",
          )}
          aria-current={page === currentPage ? "page" : undefined}
          aria-label={`Page ${page}`}
        >
          {page}
        </Link>
      ))}

      {hasNext ? (
        <Link
          href={buildHref(basePath, currentPage + 1, queryParams)}
          className={cn(
            "inline-flex items-center justify-center px-3 py-1.5 rounded text-sm",
            "text-foreground-1 hover:bg-background-2 transition-colors",
          )}
          aria-label="Next page"
        >
          &raquo;
        </Link>
      ) : (
        <span
          className="inline-flex items-center justify-center px-3 py-1.5 rounded text-sm text-foreground-3 cursor-not-allowed"
          aria-disabled="true"
          aria-label="Next page"
        >
          &raquo;
        </span>
      )}
    </nav>
  );
}

Pagination.displayName = "Pagination";

export { Pagination };
