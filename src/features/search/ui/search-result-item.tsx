import { Icon } from "@iconify/react";
import chatRoundDotsLinear from "@iconify-icons/solar/chat-round-dots-linear";
import eyeLinear from "@iconify-icons/solar/eye-linear";
import Link from "next/link";
import { highlightText } from "../lib/highlight";
import type { PostListItem } from "@entities/post";

interface SearchResultItemProps {
  post: PostListItem;
  query: string;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function SearchResultItem({ post, query }: SearchResultItemProps) {
  const publishedDate = formatDate(post.publishedAt ?? post.createdAt);
  const formattedPageviews = post.totalPageviews.toLocaleString("ko-KR");
  const formattedComments = post.commentCount.toLocaleString("ko-KR");

  return (
    <article className="surface-hover-shift group relative rounded-xl px-4 py-5 hover:bg-background-2 sm:px-5">
      <Link
        href={`/posts/${post.slug}`}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={post.title}
      />

      <div className="flex gap-4 sm:gap-5">
        <div className="surface-thumb-zoom h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-background-3 sm:h-24 sm:w-32">
          {post.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote thumbnail hosts are not all compatible with next/image
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              aria-hidden="true"
              data-thumb-zoom="true"
              className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_58%)]"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="accent-badge inline-flex items-center rounded-md px-2 py-0.5 text-ui-xs font-medium">
              {post.category.name}
            </span>
            <time
              dateTime={post.publishedAt ?? post.createdAt}
              className="text-ui-xs text-text-4"
            >
              {publishedDate}
            </time>
          </div>

          <h2 className="overflow-hidden text-ellipsis whitespace-nowrap break-keep text-base font-bold leading-snug text-text-1 transition-colors group-hover:text-primary-1 sm:text-lg">
            {highlightText(post.title, query)}
          </h2>

          {post.summary ? (
            <p className="mt-1 line-clamp-2 break-keep text-body-sm leading-relaxed text-text-3">
              {highlightText(post.summary, query)}
            </p>
          ) : null}

          {post.matchedComment ? (
            <div className="mt-1.5 rounded-lg border-l-[3px] border-primary-1 bg-background-2 px-3 py-2 text-body-xs leading-[1.5] text-text-3">
              <div className="mb-0.5 text-[0.6875rem] font-semibold text-text-4">
                일치하는 댓글
              </div>
              <p className="line-clamp-2 break-keep">
                {highlightText(post.matchedComment.body, query)}
              </p>
            </div>
          ) : null}

          <div className="mt-2 flex items-center gap-3 text-ui-xs text-text-4">
            <span
              className="flex items-center gap-1"
              aria-label={`조회수 ${formattedPageviews}회`}
            >
              <Icon icon={eyeLinear} width="14" aria-hidden="true" />
              {formattedPageviews}
            </span>
            <span
              className="flex items-center gap-1"
              aria-label={`댓글 ${formattedComments}개`}
            >
              <Icon icon={chatRoundDotsLinear} width="14" aria-hidden="true" />
              {formattedComments}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
