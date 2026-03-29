"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchPopularPostsClient, type PopularPost } from "@entities/stat";

type PopularPeriod = 7 | 30;

interface PopularPostListProps {
  initialPosts: PopularPost[] | null;
  initialDays?: PopularPeriod;
  selectedDays?: PopularPeriod;
  onSelectedDaysChange?: (days: PopularPeriod) => void;
  onItemClick?: () => void;
}

const POPULAR_POST_LIMIT = 5;
const FETCH_ERROR_MESSAGE =
  "인기 글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

export function PopularPostList({
  initialPosts,
  initialDays = 7,
  selectedDays,
  onSelectedDaysChange,
  onItemClick,
}: PopularPostListProps) {
  const [internalSelectedDays, setInternalSelectedDays] =
    useState<PopularPeriod>(initialDays);
  const [postsByDays, setPostsByDays] = useState<
    Partial<Record<PopularPeriod, PopularPost[]>>
  >(() => (initialPosts === null ? {} : { [initialDays]: initialPosts }));
  const [, setFailedDays] = useState<Partial<Record<PopularPeriod, true>>>(
    () => (initialPosts === null ? { [initialDays]: true } : {}),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialPosts === null ? FETCH_ERROR_MESSAGE : null,
  );
  const prevControlledDaysRef = useRef<PopularPeriod | undefined>(selectedDays);

  const activeDays = selectedDays ?? internalSelectedDays;
  const posts = postsByDays[activeDays];

  function updateSelectedDays(nextDays: PopularPeriod) {
    if (selectedDays === undefined) {
      setInternalSelectedDays(nextDays);
    }
    onSelectedDaysChange?.(nextDays);
  }

  async function loadDays(nextDays: PopularPeriod) {
    const cachedPosts = postsByDays[nextDays];
    if (cachedPosts !== undefined) {
      updateSelectedDays(nextDays);
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
      updateSelectedDays(nextDays);
    } catch {
      setFailedDays((current) => ({ ...current, [nextDays]: true }));
      setErrorMessage(FETCH_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (
      selectedDays === undefined ||
      prevControlledDaysRef.current === selectedDays
    ) {
      return;
    }

    prevControlledDaysRef.current = selectedDays;
    void loadDays(selectedDays);
  }, [selectedDays]);

  return (
    <div>
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
          {posts.map((post) => (
            <li key={post.postId}>
              <Link
                href={`/posts/${post.slug}`}
                onClick={onItemClick}
                className="group block min-h-[3rem] rounded-md px-0.5 py-1 transition-colors hover:text-primary-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1"
              >
                <span className="line-clamp-2 block text-ui-sm font-medium leading-[1.4] text-text-2 transition-colors group-hover:text-primary-1">
                  {post.title}
                </span>
                <span className="mt-0.5 block text-[0.688rem] leading-4 text-text-4">
                  조회 {post.pageviews.toLocaleString("ko-KR")}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
