import { Icon } from "@iconify/react";
import chatRoundDotsLinear from "@iconify-icons/solar/chat-round-dots-linear";
import eyeLinear from "@iconify-icons/solar/eye-linear";
import pinBold from "@iconify-icons/solar/pin-bold";
import Link from "next/link";
import type { Post } from "@entities/post";
import { formatNumber } from "@shared/lib/format-number";

interface ArchivePostItemProps {
  post: Post;
  animationDelayMs?: number;
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

export function ArchivePostItem({
  post,
  animationDelayMs,
}: ArchivePostItemProps) {
  const publishedDate = formatDate(post.publishedAt ?? post.createdAt);

  return (
    <article
      className="surface-hover-shift motion-reveal group relative rounded-xl px-4 py-5 sm:px-5 hover:bg-background-2"
      style={
        animationDelayMs
          ? { animationDelay: `${animationDelayMs}ms` }
          : undefined
      }
    >
      <Link
        href={`/posts/${post.slug}`}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={post.title}
      />
      <div className="flex gap-4 sm:gap-5">
        {post.thumbnailUrl ? (
          <div className="surface-thumb-zoom h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-background-3 sm:h-24 sm:w-32">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote thumbnail hosts are not all compatible with next/image */}
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {post.isPinned ? (
              <span
                className="motion-pin-float inline-flex items-center text-primary-1"
                aria-label="고정된 글"
              >
                <Icon icon={pinBold} width="14" aria-hidden="true" />
              </span>
            ) : null}
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

          <h2 className="overflow-hidden text-ellipsis whitespace-nowrap break-keep text-base leading-snug font-bold text-text-1 sm:text-lg">
            {post.title}
          </h2>

          {post.summary ? (
            <p className="mt-1 hidden line-clamp-2 break-keep text-body-sm leading-relaxed text-text-3 sm:block">
              {post.summary}
            </p>
          ) : null}

          <div className="mt-2 flex items-center gap-3">
            <span
              className="flex items-center gap-1 text-ui-xs text-text-4"
              aria-label={`조회수 ${formatNumber(post.totalPageviews)}회`}
            >
              <Icon icon={eyeLinear} width="14" aria-hidden="true" />
              {formatNumber(post.totalPageviews)}
            </span>
            <span
              className="flex items-center gap-1 text-ui-xs text-text-4"
              aria-label={`댓글 ${formatNumber(post.commentCount)}개`}
            >
              <Icon icon={chatRoundDotsLinear} width="14" aria-hidden="true" />
              {formatNumber(post.commentCount)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
