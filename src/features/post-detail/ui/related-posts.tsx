import { Icon } from "@iconify/react";
import documentTextLinear from "@iconify-icons/solar/document-text-linear";
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
      <h2 className="mb-3 flex items-center gap-1.5 text-body-sm font-bold leading-none text-text-1">
        <Icon
          icon={documentTextLinear}
          width="16"
          aria-hidden="true"
          className="text-text-3"
        />
        관련 글
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 pr-8 [scrollbar-width:none] [scroll-snap-type:x_mandatory] sm:mx-0 sm:px-0 sm:pr-0 [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group block w-[11.75rem] shrink-0 overflow-hidden rounded-[0.75rem] border border-border-3 bg-background-2 text-decoration-none transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] [scroll-snap-align:start] hover:-translate-y-[3px] hover:border-primary-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="aspect-[16/10] overflow-hidden bg-background-3">
              {post.thumbnailUrl ? (
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  width={180}
                  height={113}
                  sizes="180px"
                  className="h-full w-full object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-background-3" />
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-2 break-keep text-ui-xs font-semibold leading-[1.4] text-text-1">
                {post.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
