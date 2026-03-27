"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post } from "@entities/post";
import type { PopularPost } from "@entities/stat";
import { cn } from "@shared/lib/style-utils";

interface RecentPopularPostsProps {
  recentPosts: Post[];
  popularPosts: PopularPost[];
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
}: RecentPopularPostsProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "popular">("recent");

  const items =
    activeTab === "recent"
      ? recentPosts.map((p) => ({
          id: p.id,
          title: p.title,
          href: `/posts/${p.slug}`,
          date: formatDate(p.publishedAt ?? p.createdAt),
        }))
      : popularPosts.map((p) => ({
          id: p.postId,
          title: p.title,
          href: `/posts/${p.slug}`,
          date: `조회 ${p.pageviews.toLocaleString()}`,
        }));

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

      {/* List */}
      {items.length === 0 ? (
        <p className="py-3 text-center text-body-sm text-text-4">
          글이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex flex-col gap-0.5 rounded-lg px-1 py-1 transition-colors hover:bg-background-2"
              >
                <span className="line-clamp-2 text-body-sm text-text-1 transition-colors group-hover:text-primary-1">
                  {item.title}
                </span>
                <span className="text-body-xs text-text-4">{item.date}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
