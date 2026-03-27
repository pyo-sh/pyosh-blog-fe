import Image from "next/image";
import Link from "next/link";
import type { Post } from "@entities/post";
import { cn } from "@shared/lib/style-utils";

interface PostListItemProps {
  post: Post;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function supportsNextImage(src: string | null): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;

  try {
    const url = new URL(src);

    return url.protocol === "https:" && url.hostname === "github.com";
  } catch {
    return false;
  }
}

export function PostListItem({ post }: PostListItemProps) {
  const publishedDate = formatDate(post.publishedAt ?? post.createdAt);
  const modifiedDate = post.contentModifiedAt
    ? formatDate(post.contentModifiedAt)
    : null;
  const canUseNextImage = supportsNextImage(post.thumbnailUrl);
  const formattedPageviews = post.totalPageviews.toLocaleString("ko-KR");

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex overflow-hidden rounded-2xl border border-border-3 bg-background-1 transition-colors hover:border-border-2"
    >
      {/* Thumbnail — md+ only */}
      {post.thumbnailUrl && (
        <div className="relative hidden w-44 shrink-0 overflow-hidden bg-background-3 md:block">
          {canUseNextImage ? (
            <Image
              fill
              src={post.thumbnailUrl}
              alt={post.title}
              sizes="176px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- next/image cannot safely render arbitrary remote hosts here
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
        </div>
      )}

      <article className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-5 sm:px-5">
        {/* Category + date row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-4">
          {post.isPinned && (
            <PinIcon className="shrink-0 text-primary-1" aria-label="Pinned" />
          )}
          <span className={cn("font-medium text-primary-1")}>
            {post.category.name}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt ?? post.createdAt}>
            {publishedDate}
          </time>
          <span aria-hidden="true">·</span>
          <span aria-label={`조회수 ${formattedPageviews}회`}>
            조회 {formattedPageviews}
          </span>
          {modifiedDate && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-text-4">수정: {modifiedDate}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="line-clamp-2 break-keep text-base font-bold leading-snug text-text-1 transition-colors group-hover:text-primary-1 sm:text-lg">
          {post.title}
        </h2>

        {/* Summary */}
        {post.summary && (
          <p className="line-clamp-2 break-keep text-sm leading-relaxed text-text-3">
            {post.summary}
          </p>
        )}

        {/* Stats */}
        <div className="mt-auto flex items-center gap-3 text-xs text-text-4">
          <span className="flex items-center gap-1">
            <CommentIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {post.commentCount.toLocaleString()}
          </span>
        </div>

        {/* Tag badges — text only, no link */}
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="태그">
            {post.tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-full border border-border-3 px-3 py-1 text-body-xs text-text-4"
              >
                #{tag.name}
              </li>
            ))}
          </ul>
        )}
      </article>
    </Link>
  );
}

function PinIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="14"
      height="14"
      role="img"
      className={className}
      {...props}
    >
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
    </svg>
  );
}

function CommentIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
