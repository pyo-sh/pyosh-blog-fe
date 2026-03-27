import Image from "next/image";
import Link from "next/link";
import type { Post } from "@entities/post";

interface RelatedPostsProps {
  posts: Array<Pick<Post, "id" | "slug" | "title" | "thumbnailUrl">>;
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-label="관련 글">
      <h2 className="mb-4 text-body-sm font-semibold text-text-2">관련 글</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group flex w-[180px] shrink-0 flex-col gap-2 [scroll-snap-align:start]"
          >
            <div className="aspect-[16/10] overflow-hidden rounded-lg bg-background-3 transition-transform duration-200 group-hover:-translate-y-[3px] group-hover:shadow-md">
              {post.thumbnailUrl ? (
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  width={180}
                  height={113}
                  sizes="180px"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-background-3" />
              )}
            </div>
            <p className="line-clamp-2 text-xs font-semibold text-text-2 group-hover:text-text-1">
              {post.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
