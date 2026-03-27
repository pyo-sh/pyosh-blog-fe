"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post } from "@entities/post";
import type { PopularPost } from "@entities/stat";
import { PopularPostList } from "@features/popular-posts";
import { cn } from "@shared/lib/style-utils";

interface RecentPopularPostsProps {
  recentPosts: Post[];
  popularPosts: PopularPost[];
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
      {/* Tabs */}
      <div className="mb-3 flex border-b border-border-3" role="tablist">
        {(["recent", "popular"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 pb-2 text-body-sm transition-colors",
              activeTab === tab
                ? "border-b-2 border-primary-1 font-medium text-primary-1"
                : "text-text-3 hover:text-text-1",
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
          <ul className="flex flex-col gap-2">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.slug}`}
                  onClick={onItemClick}
                  className="group flex flex-col gap-0.5 rounded-lg px-1 py-1 transition-colors hover:bg-background-2"
                >
                  <span className="line-clamp-2 text-body-sm text-text-1 transition-colors group-hover:text-primary-1">
                    {post.title}
                  </span>
                  <span className="text-body-xs text-text-4">
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
