import { PostListSkeleton } from "@features/post-list/ui/post-list-skeleton";
import { Skeleton } from "@shared/ui/libs";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[67.5rem] px-4 md:px-6">
      <aside aria-hidden="true" className="hidden w-[240px] shrink-0 lg:block">
        <div className="border-r border-border-3 pt-8 pb-16 pr-8">
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton height="0.75rem" width="4rem" tone="soft" />
                <Skeleton repeat={3} height="0.875rem" tone="soft" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main aria-busy="true" className="min-w-0 flex-1 pt-8 pb-16 lg:pl-8">
        <div className="flex w-full flex-col gap-3">
          <header className="pb-1">
            <Skeleton height="1.938rem" width="6rem" className="rounded-lg" />
          </header>
          <PostListSkeleton />
        </div>
      </main>
    </div>
  );
}
