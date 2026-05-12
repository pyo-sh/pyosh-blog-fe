import { Skeleton } from "@shared/ui/libs";

export default function DashboardLoading() {
  return (
    <div aria-busy="true" className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border-4 bg-background-2 p-5"
          >
            <Skeleton
              height="2.5rem"
              width="2.5rem"
              className="rounded-[0.625rem]"
            />
            <div className="mt-5">
              <Skeleton height="1.75rem" width="5rem" />
            </div>
            <div className="mt-3">
              <Skeleton height="0.875rem" width="4.5rem" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border-4 bg-background-2 p-5"
          >
            <div className="flex items-center gap-2">
              <Skeleton height="1rem" width="1rem" />
              <Skeleton height="1rem" width="4rem" />
            </div>
            <div className="mt-5">
              <Skeleton height="1.75rem" width="3rem" />
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border-4 bg-background-2 p-5">
        <div className="mb-4 flex items-center gap-3">
          <Skeleton height="1.25rem" width="5rem" />
          <Skeleton height="1.25rem" width="3rem" className="rounded-md" />
          <Skeleton height="1rem" width="4rem" className="ml-auto" />
        </div>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-3 rounded-lg px-2 py-3">
              <Skeleton height="2rem" width="2rem" className="rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton height="1rem" width="2.25rem" />
                  <Skeleton height="1rem" width="4rem" />
                  <Skeleton height="1rem" width="10rem" />
                </div>
                <Skeleton height="1rem" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
