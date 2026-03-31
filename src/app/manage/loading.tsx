import { Skeleton } from "@shared/ui/libs";

export default function DashboardLoading() {
  return (
    <div aria-busy="true" className="space-y-8">
      <div className="motion-reveal rounded-[1.75rem] border border-border-3 bg-background-2/90 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.06)]">
        <div className="space-y-3">
          <Skeleton height="1rem" width="6rem" />
          <Skeleton
            height="2.25rem"
            width="12rem"
            className="rounded-[1rem]"
            tone="strong"
          />
          <Skeleton width="18rem" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.5rem] border border-border-3 bg-background-2/90 p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)]"
          >
            <div className="mb-4">
              <Skeleton height="1rem" width="5rem" />
            </div>
            <div className="mb-3">
              <Skeleton height="2.5rem" width="6rem" tone="strong" />
            </div>
            <Skeleton />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.5rem] border border-border-3 bg-background-2/90 p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)]"
          >
            <Skeleton height="1rem" width="7rem" />
            <div className="mt-4">
              <Skeleton height="2rem" width="10rem" tone="strong" />
            </div>
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((__, innerIndex) => (
                <Skeleton
                  key={innerIndex}
                  variant="rect"
                  height="4.5rem"
                  className="rounded-[1rem]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
