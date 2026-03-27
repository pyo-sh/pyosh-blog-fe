"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchPopularPostsClient, type PopularPost } from "@entities/stat";
import { cn } from "@shared/lib/style-utils";

type PopularPeriod = 7 | 30;

interface PopularPostListProps {
  initialPosts: PopularPost[];
  initialDays?: PopularPeriod;
  onItemClick?: () => void;
}

const PERIOD_OPTIONS = [
  { days: 7, label: "7일" },
  { days: 30, label: "30일" },
] as const;

const POPULAR_POST_LIMIT = 5;
const FETCH_ERROR_MESSAGE =
  "인기 글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

export function PopularPostList({
  initialPosts,
  initialDays = 7,
  onItemClick,
}: PopularPostListProps) {
  const [selectedDays, setSelectedDays] = useState<PopularPeriod>(initialDays);
  const [postsByDays, setPostsByDays] = useState<
    Partial<Record<PopularPeriod, PopularPost[]>>
  >({
    [initialDays]: initialPosts,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const posts = postsByDays[selectedDays] ?? [];

  async function handlePeriodChange(nextDays: PopularPeriod) {
    if (nextDays === selectedDays || isLoading) {
      return;
    }

    const cachedPosts = postsByDays[nextDays];
    if (cachedPosts) {
      setSelectedDays(nextDays);
      setErrorMessage(null);

      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextPosts = await fetchPopularPostsClient(
        nextDays,
        POPULAR_POST_LIMIT,
      );
      setPostsByDays((current) => ({ ...current, [nextDays]: nextPosts }));
      setSelectedDays(nextDays);
    } catch {
      setErrorMessage(FETCH_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div
        className="mb-3 inline-flex rounded-full border border-border-3 bg-background-2 p-1"
        role="tablist"
        aria-label="인기 글 기간 선택"
      >
        {PERIOD_OPTIONS.map((option) => {
          const isActive = option.days === selectedDays;

          return (
            <button
              key={option.days}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => void handlePeriodChange(option.days)}
              disabled={isLoading}
              className={cn(
                "rounded-full px-3 py-1.5 text-body-xs font-medium transition-colors",
                isActive
                  ? "bg-background-1 text-text-1"
                  : "text-text-3 hover:text-text-1",
                isLoading && "cursor-wait",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {errorMessage ? (
        <p className="mb-3 text-body-xs text-negative-1" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {posts.length === 0 ? (
        <p className="py-3 text-center text-body-sm text-text-4">
          아직 집계된 인기 글이 없습니다.
        </p>
      ) : (
        <ol
          className="flex flex-col gap-2"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {posts.map((post, index) => (
            <li key={post.postId}>
              <Link
                href={`/posts/${post.slug}`}
                onClick={onItemClick}
                className="group grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 rounded-lg px-1 py-1 transition-colors hover:bg-background-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1"
              >
                <span className="pt-0.5 text-body-sm text-text-3">
                  {index + 1}.
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-1 block text-body-sm text-text-1 transition-colors group-hover:text-primary-1">
                    {post.title}
                  </span>
                  <span className="mt-1 block text-body-xs text-text-4">
                    {post.pageviews.toLocaleString("ko-KR")} views
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
