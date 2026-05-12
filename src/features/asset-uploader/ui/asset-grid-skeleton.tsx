export function AssetGridSkeleton() {
  return (
    <section aria-busy="true" className="space-y-6">
      <div className="border-b border-border-4 pb-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
          <div className="flex min-w-0 gap-2">
            <div className="h-10 w-[5.75rem] shrink-0 animate-pulse rounded-xl bg-background-3" />
            <div className="h-10 min-w-0 flex-1 animate-pulse rounded-xl bg-background-3" />
          </div>
          <div className="h-10 animate-pulse rounded-xl bg-background-3" />
          <div className="h-10 animate-pulse rounded-xl bg-background-3 lg:w-[5.75rem]" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border-4 bg-background-2"
          >
            <div className="aspect-4/3 animate-pulse bg-background-3" />
            <div className="space-y-1 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-[13px] w-2/3 animate-pulse rounded bg-background-3" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-background-3" />
                </div>
                <div className="h-5 w-14 shrink-0 animate-pulse rounded-full bg-background-3" />
              </div>
              <div className="h-3 w-4/5 animate-pulse rounded bg-background-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
