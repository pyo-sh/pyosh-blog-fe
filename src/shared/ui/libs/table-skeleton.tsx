import { Skeleton } from "./skeleton";
import { cn } from "@shared/lib/style-utils";

interface TableSkeletonColumn {
  width?: string;
  className?: string;
}

interface TableSkeletonProps {
  columns: TableSkeletonColumn[];
  rows?: number;
  rowHeight?: string;
  containerClassName?: string;
  headerClassName?: string;
}

export function TableSkeleton({
  columns,
  rows = 6,
  rowHeight = "3.25rem",
  containerClassName,
  headerClassName,
}: TableSkeletonProps) {
  return (
    <div
      aria-busy="true"
      className={cn(
        "overflow-hidden rounded-2xl border border-border-4 bg-background-1",
        containerClassName,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead
            className={cn(
              "bg-background-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-text-4",
              headerClassName,
            )}
          >
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    "whitespace-nowrap px-3 py-3.5 align-middle font-medium leading-none",
                    column.className,
                  )}
                  style={column.width ? { width: column.width } : undefined}
                >
                  <Skeleton height="0.75rem" tone="soft" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-4">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={cn(
                      "whitespace-nowrap px-3 py-3.5 align-middle leading-none",
                      column.className,
                    )}
                    style={
                      column.width
                        ? { width: column.width, height: rowHeight }
                        : { height: rowHeight }
                    }
                  >
                    <Skeleton
                      height={columnIndex === 0 ? "1rem" : "0.875rem"}
                      width={getCellWidth(columnIndex)}
                      tone={columnIndex === 0 ? "strong" : "soft"}
                      className={columnIndex === 0 ? "rounded" : undefined}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getCellWidth(index: number) {
  const widths = ["1rem", "70%", "55%", "80%", "48%", "2rem", "4rem"];

  return widths[index % widths.length];
}
