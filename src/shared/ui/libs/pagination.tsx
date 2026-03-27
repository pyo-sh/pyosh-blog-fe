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

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  windowSize: number,
): Array<number | "..."> {
  if (totalPages <= 1) return [];

  const windowStart = Math.max(2, currentPage - windowSize);
  const windowEnd = Math.min(totalPages - 1, currentPage + windowSize);
  const pages: Array<number | "..."> = [1];

  if (windowStart > 2) pages.push("...");

  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  if (windowEnd < totalPages - 1) pages.push("...");

  pages.push(totalPages);

  return pages;
}

const navBtnBase =
  "inline-flex items-center justify-center px-2.5 py-1.5 rounded text-sm transition-colors";

function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams,
}: IPaginationProps) {
  if (totalPages <= 1) return null;

  const jumpFive = 5;
  const prevFivePage = Math.max(1, currentPage - jumpFive);
  const nextFivePage = Math.min(totalPages, currentPage + jumpFive);

  const hasPrevFive = currentPage > jumpFive;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const hasNextFive = currentPage + jumpFive <= totalPages;

  const mobilePages = generatePageNumbers(currentPage, totalPages, 1);
  const desktopPages = generatePageNumbers(currentPage, totalPages, 3);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-0.5"
    >
      {/* << −5 */}
      {hasPrevFive ? (
        <Link
          href={buildHref(basePath, prevFivePage, queryParams)}
          className={cn(navBtnBase, "text-text-1 hover:bg-background-2")}
          aria-label="5 pages back"
        >
          &laquo;
        </Link>
      ) : (
        <span
          className={cn(navBtnBase, "text-text-4 cursor-not-allowed")}
          aria-disabled="true"
          aria-label="5 pages back"
        >
          &laquo;
        </span>
      )}

      {/* < −1 */}
      {hasPrev ? (
        <Link
          href={buildHref(basePath, currentPage - 1, queryParams)}
          className={cn(navBtnBase, "text-text-1 hover:bg-background-2")}
          aria-label="Previous page"
        >
          &lsaquo;
        </Link>
      ) : (
        <span
          className={cn(navBtnBase, "text-text-4 cursor-not-allowed")}
          aria-disabled="true"
          aria-label="Previous page"
        >
          &lsaquo;
        </span>
      )}

      {/* Page numbers with ellipsis — mobile: ±1, desktop: ±3 */}
      <span className="contents md:hidden">
        {mobilePages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`m-ellipsis-${idx}`}
              className={cn(navBtnBase, "text-text-4 select-none")}
              aria-hidden="true"
            >
              &hellip;
            </span>
          ) : (
            <Link
              key={`m-${page}`}
              href={buildHref(basePath, page, queryParams)}
              tabIndex={page === currentPage ? -1 : undefined}
              className={cn(
                navBtnBase,
                "min-w-[2rem]",
                page === currentPage
                  ? "bg-primary-1 text-white font-semibold pointer-events-none"
                  : "text-text-1 hover:bg-background-2",
              )}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Link>
          ),
        )}
      </span>
      <span className="hidden md:contents">
        {desktopPages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`d-ellipsis-${idx}`}
              className={cn(navBtnBase, "text-text-4 select-none")}
              aria-hidden="true"
            >
              &hellip;
            </span>
          ) : (
            <Link
              key={`d-${page}`}
              href={buildHref(basePath, page, queryParams)}
              tabIndex={page === currentPage ? -1 : undefined}
              className={cn(
                navBtnBase,
                "min-w-[2rem]",
                page === currentPage
                  ? "bg-primary-1 text-white font-semibold pointer-events-none"
                  : "text-text-1 hover:bg-background-2",
              )}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Link>
          ),
        )}
      </span>

      {/* > +1 */}
      {hasNext ? (
        <Link
          href={buildHref(basePath, currentPage + 1, queryParams)}
          className={cn(navBtnBase, "text-text-1 hover:bg-background-2")}
          aria-label="Next page"
        >
          &rsaquo;
        </Link>
      ) : (
        <span
          className={cn(navBtnBase, "text-text-4 cursor-not-allowed")}
          aria-disabled="true"
          aria-label="Next page"
        >
          &rsaquo;
        </span>
      )}

      {/* >> +5 */}
      {hasNextFive ? (
        <Link
          href={buildHref(basePath, nextFivePage, queryParams)}
          className={cn(navBtnBase, "text-text-1 hover:bg-background-2")}
          aria-label="5 pages forward"
        >
          &raquo;
        </Link>
      ) : (
        <span
          className={cn(navBtnBase, "text-text-4 cursor-not-allowed")}
          aria-disabled="true"
          aria-label="5 pages forward"
        >
          &raquo;
        </span>
      )}
    </nav>
  );
}

Pagination.displayName = "Pagination";

export { Pagination };
