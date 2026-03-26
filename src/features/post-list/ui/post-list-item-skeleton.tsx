export function PostListItemSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-border-3 bg-background-1">
      {/* Thumbnail placeholder — md+ only */}
      <div className="hidden w-44 shrink-0 animate-pulse bg-background-3 md:block" />

      <div className="flex flex-1 flex-col gap-3 px-4 py-5 sm:px-5">
        {/* Category + date row */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-background-3" />
          <div className="h-4 w-20 animate-pulse rounded bg-background-3" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-5 w-full animate-pulse rounded bg-background-3" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-background-3" />
        </div>

        {/* Summary */}
        <div className="space-y-1">
          <div className="h-4 w-full animate-pulse rounded bg-background-3" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-background-3" />
        </div>

        {/* Stats */}
        <div className="mt-auto flex items-center gap-3">
          <div className="h-3.5 w-12 animate-pulse rounded bg-background-3" />
          <div className="h-3.5 w-10 animate-pulse rounded bg-background-3" />
        </div>
      </div>
    </div>
  );
}
