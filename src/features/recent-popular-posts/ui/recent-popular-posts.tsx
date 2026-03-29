"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post } from "@entities/post";
import type { PopularPost } from "@entities/stat";
import { PopularPostList } from "@features/popular-posts";
import { cn } from "@shared/lib/style-utils";

interface RecentPopularPostsProps {
  recentPosts: Post[];
  popularPosts: PopularPost[] | null;
  onItemClick?: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

function formatDate(value: string | null) {
  if (!value) return "";

  return dateFormatter.format(new Date(value));
}

export function RecentPopularPosts({
  recentPosts,
  popularPosts,
  onItemClick,
}: RecentPopularPostsProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "popular">("recent");

  return (
    <div>
      <div className="mb-3 flex items-center gap-1" role="tablist">
        {(["recent", "popular"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-3 py-1 text-[0.8rem] font-medium transition-colors",
              activeTab === tab
                ? "bg-primary-1/12 font-semibold text-primary-1"
                : "text-text-3 hover:text-text-2",
            )}
          >
            {tab === "recent" ? "최근글" : "인기글"}
          </button>
        ))}
      </div>

      {activeTab === "recent" ? (
        recentPosts.length === 0 ? (
          <p className="py-3 text-center text-body-sm text-text-4">
            글이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.slug}`}
                  onClick={onItemClick}
                  className="group block rounded-md px-0.5 py-1 transition-colors hover:text-primary-1"
                >
                  <span className="line-clamp-2 text-body-sm leading-5 text-text-1 transition-colors group-hover:text-primary-1">
                    {post.title}
                  </span>
                  <span className="mt-0.5 text-ui-xs text-text-4">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <PopularPostList
          initialPosts={popularPosts}
          onItemClick={onItemClick}
        />
      )}
    </div>
  );
}
