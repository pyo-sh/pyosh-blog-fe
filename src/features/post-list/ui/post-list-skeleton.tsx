import { PostListItemSkeleton } from "./post-list-item-skeleton";

const SKELETON_COUNT = 10;

export function PostListSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <PostListItemSkeleton key={i} />
      ))}
    </div>
  );
}
