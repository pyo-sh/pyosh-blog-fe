import Image from "next/image";
import Link from "next/link";
import type { PostListItem } from "@entities/post";
import { cn } from "@shared/lib/style-utils";

interface PostCardProps {
  post: PostListItem;
  className?: string;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

export function PostCard({ post, className }: PostCardProps) {
  const summary = post.summary?.trim();
  const publishedDate = formatDate(post.publishedAt ?? post.createdAt);
  const canUseNextImage = supportsNextImage(post.thumbnailUrl);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "group flex overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-1 transition-colors hover:border-border-2",
        className,
      )}
    >
      {post.thumbnailUrl && (
        <div className="relative hidden w-48 shrink-0 overflow-hidden bg-background-3 md:block">
          {canUseNextImage ? (
            <Image
              fill
              src={post.thumbnailUrl}
              alt={post.title}
              sizes="192px"
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
      <article className="flex min-w-0 flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body-xs text-text-4">
          <span className="inline-flex items-center rounded-full bg-background-2 px-3 py-1 text-text-3">
            {post.category.name}
          </span>
          <time dateTime={post.publishedAt ?? post.createdAt}>
            {publishedDate}
          </time>
        </div>
        <div className="space-y-3">
          <h2 className="line-clamp-2 text-body-lg font-semibold text-text-1 transition-colors group-hover:text-primary-1">
            {post.title}
          </h2>
          {summary ? (
            <p className="line-clamp-3 whitespace-pre-wrap text-body-sm text-text-3">
              {summary}
            </p>
          ) : null}
        </div>
        {post.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-full border border-border-3 px-3 py-1 text-body-xs text-text-4 transition-colors group-hover:border-border-2 group-hover:text-text-3"
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

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function supportsNextImage(src: string | null) {
  if (!src) {
    return false;
  }

  if (src.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(src);

    return url.protocol === "https:" && url.hostname === "github.com";
  } catch {
    return false;
  }
}
