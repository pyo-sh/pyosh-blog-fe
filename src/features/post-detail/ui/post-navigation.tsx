import Link from "next/link";
import {
  buildPostHref,
  PostNavigation as PostNavigationEntity,
} from "@entities/post";

interface PostNavigationProps {
  prevPost: PostNavigationEntity | null;
  nextPost: PostNavigationEntity | null;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  return (
    <nav className="flex justify-between gap-4">
      <div className="flex-1">
        {prevPost && (
          <Link
            href={buildPostHref(prevPost.slug)}
            className="flex flex-col gap-1 p-4 rounded-lg border border-border-3 hover:border-border-2 transition-colors"
          >
            <span className="text-body-xs text-text-4">이전 글</span>
            <span className="text-body-sm text-text-2">{prevPost.title}</span>
          </Link>
        )}
      </div>
      <div className="flex-1 flex justify-end">
        {nextPost && (
          <Link
            href={buildPostHref(nextPost.slug)}
            className="flex flex-col gap-1 p-4 rounded-lg border border-border-3 hover:border-border-2 transition-colors text-right w-full"
          >
            <span className="text-body-xs text-text-4">다음 글</span>
            <span className="text-body-sm text-text-2">{nextPost.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
