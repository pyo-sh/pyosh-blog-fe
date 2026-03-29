export function PostListItemSkeleton() {
  return (
    <article className="rounded-xl px-4 py-5 sm:px-5">
      <div className="flex gap-4 sm:gap-5">
        <div className="h-16 w-20 shrink-0 animate-pulse rounded-lg bg-background-3 sm:h-24 sm:w-32" />

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-background-3" />
            <div className="h-5 w-16 animate-pulse rounded-md bg-background-3" />
            <div className="h-4 w-20 animate-pulse rounded bg-background-3" />
          </div>

          <div className="h-5 w-[92%] animate-pulse rounded bg-background-3 sm:h-6" />

          <div className="mt-2 hidden space-y-1 sm:block">
            <div className="h-4 w-full animate-pulse rounded bg-background-3" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-background-3" />
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-4 w-12 animate-pulse rounded bg-background-3" />
            <div className="h-4 w-10 animate-pulse rounded bg-background-3" />
          </div>
        </div>
      </div>
    </article>
  );
}
