"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostListItem } from "@entities/post";
import type { PopularPost } from "@entities/stat";
import { PopularPostList } from "@features/popular-posts";
import { cn } from "@shared/lib/style-utils";

interface RecentPopularPostsProps {
  recentPosts: PostListItem[];
  popularPosts: PopularPost[] | null;
  onItemClick?: () => void;
}

const POPULAR_PERIOD_OPTIONS = [
  { days: 7, label: "7일" },
  { days: 30, label: "30일" },
] as const;

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
  const [selectedPopularDays, setSelectedPopularDays] = useState<7 | 30>(7);
  const [popularReloadToken, setPopularReloadToken] = useState(0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1" role="tablist">
          {(["recent", "popular"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[0.8rem] font-medium transition-colors",
                activeTab === tab
                  ? "bg-primary-1/12 font-semibold text-primary-1"
                  : "text-text-3 hover:text-text-2",
              )}
            >
              {tab === "recent" ? "최근글" : "인기글"}
            </button>
          ))}
        </div>

        {activeTab === "popular" ? (
          <div
            className="flex items-center gap-0.75"
            role="tablist"
            aria-label="인기 글 기간 선택"
          >
            {POPULAR_PERIOD_OPTIONS.map((option) => {
              const isActive = option.days === selectedPopularDays;

              return (
                <button
                  key={option.days}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    if (option.days === selectedPopularDays) {
                      setPopularReloadToken((current) => current + 1);

                      return;
                    }

                    setSelectedPopularDays(option.days);
                  }}
                  className={cn(
                    "inline-flex min-h-5 rounded-full border px-2 py-[2px] text-[0.688rem] leading-3.5 font-normal transition-colors",
                    isActive
                      ? "border-primary-1 bg-primary-1/6 text-primary-1"
                      : "border-border-3 text-text-3 hover:border-primary-1 hover:bg-primary-1/6 hover:text-primary-1",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
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
                  className="group block min-h-[3rem] rounded-md px-0.5 py-1 transition-colors hover:text-primary-1"
                >
                  <span className="line-clamp-2 block text-ui-sm font-medium leading-[1.4] text-text-2 transition-colors group-hover:text-primary-1">
                    {post.title}
                  </span>
                  <span className="mt-0.5 block text-[0.688rem] leading-4 text-text-4">
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
          selectedDays={selectedPopularDays}
          reloadToken={popularReloadToken}
          onSelectedDaysChange={setSelectedPopularDays}
          onItemClick={onItemClick}
        />
      )}
    </div>
  );
}
