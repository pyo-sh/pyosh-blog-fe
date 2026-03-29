"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchPopularPostsClient, type PopularPost } from "@entities/stat";
import { cn } from "@shared/lib/style-utils";

type PopularPeriod = 7 | 30;

interface PopularPostListProps {
  initialPosts: PopularPost[] | null;
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
  >(() => (initialPosts === null ? {} : { [initialDays]: initialPosts }));
  const [failedDays, setFailedDays] = useState<
    Partial<Record<PopularPeriod, true>>
  >(() => (initialPosts === null ? { [initialDays]: true } : {}));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialPosts === null ? FETCH_ERROR_MESSAGE : null,
  );

  const posts = postsByDays[selectedDays];

  async function handlePeriodChange(nextDays: PopularPeriod) {
    const isRetryingFailedSelection =
      nextDays === selectedDays && failedDays[nextDays];

    if (
      (nextDays === selectedDays && !isRetryingFailedSelection) ||
      isLoading
    ) {
      return;
    }

    const cachedPosts = postsByDays[nextDays];
    if (cachedPosts !== undefined) {
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
      setFailedDays((current) => {
        const next = { ...current };
        delete next[nextDays];

        return next;
      });
      setSelectedDays(nextDays);
    } catch {
      setFailedDays((current) => ({ ...current, [nextDays]: true }));
      setErrorMessage(FETCH_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div
        className="mb-3 flex items-center gap-1"
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
                "rounded-md px-3 py-1 text-[0.8rem] font-medium transition-colors",
                isActive
                  ? "bg-primary-1/12 font-semibold text-primary-1"
                  : "text-text-3 hover:text-text-2",
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

      {posts === undefined ? null : posts.length === 0 ? (
        <p className="py-3 text-center text-body-sm text-text-4">
          아직 집계된 인기 글이 없습니다.
        </p>
      ) : (
        <ol
          className="flex flex-col gap-1.5"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {posts.map((post, index) => (
            <li key={post.postId}>
              <Link
                href={`/posts/${post.slug}`}
                onClick={onItemClick}
                className="group grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 rounded-md px-0.5 py-1 transition-colors hover:text-primary-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1"
              >
                <span className="pt-0.5 text-body-sm text-text-3">
                  {index + 1}.
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-body-sm leading-5 text-text-1 transition-colors group-hover:text-primary-1">
                    {post.title}
                  </span>
                  <span className="mt-0.5 block text-ui-xs text-text-4">
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
