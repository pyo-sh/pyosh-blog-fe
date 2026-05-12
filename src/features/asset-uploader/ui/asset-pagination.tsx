interface AssetPaginationProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  windowSize: number,
): Array<number | "..."> {
  if (totalPages <= 1) return [1];

  const windowStart = Math.max(2, currentPage - windowSize);
  const windowEnd = Math.min(totalPages - 1, currentPage + windowSize);
  const pages: Array<number | "..."> = [1];

  if (windowStart > 2) pages.push("...");
  for (let index = windowStart; index <= windowEnd; index += 1) {
    pages.push(index);
  }
  if (windowEnd < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

export function AssetPagination({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: AssetPaginationProps) {
  const pageNumbers = generatePageNumbers(page, totalPages, 2);

  return (
    <>
      <nav
        aria-label="관리자 에셋 페이지네이션"
        className="flex items-center justify-center gap-0.5"
      >
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 5))}
          disabled={page <= 5}
          className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
          aria-label="5 pages back"
        >
          &laquo;
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
          aria-label="Previous page"
        >
          &lsaquo;
        </button>
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-4"
              aria-hidden="true"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={pageNumber === page}
              className={
                pageNumber === page
                  ? "pointer-events-none inline-flex min-w-[2rem] items-center justify-center rounded bg-primary-1 px-2.5 py-1.5 text-sm font-semibold text-white"
                  : "inline-flex min-w-[2rem] items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2"
              }
              aria-current={pageNumber === page ? "page" : undefined}
              aria-label={`Page ${pageNumber}`}
            >
              {pageNumber}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
          aria-label="Next page"
        >
          &rsaquo;
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 5))}
          disabled={page + 5 > totalPages}
          className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
          aria-label="5 pages forward"
        >
          &raquo;
        </button>
      </nav>
      {isFetching ? (
        <p className="text-center text-sm text-text-3">
          목록을 새로 불러오는 중...
        </p>
      ) : null}
    </>
  );
}
