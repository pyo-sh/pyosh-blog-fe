export function AssetGridSkeleton() {
  return (
    <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.4rem] border border-border-3 bg-background-1"
          >
            <div className="aspect-4/3 animate-pulse bg-background-3" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-background-3" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-background-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
