"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchPopularPostsClient, type PopularPost } from "@entities/stat";

type PopularPeriod = 7 | 30;

interface PopularPostListProps {
  initialPosts: PopularPost[] | null;
  initialDays?: PopularPeriod;
  selectedDays?: PopularPeriod;
  reloadToken?: number;
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
  reloadToken,
  onItemClick,
}: PopularPostListProps) {
  const [displayedDays, setDisplayedDays] =
    useState<PopularPeriod>(initialDays);
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
  const prevControlledDaysRef = useRef<PopularPeriod | undefined>(selectedDays);
  const prevReloadTokenRef = useRef<number | undefined>(reloadToken);
  const latestRequestIdRef = useRef(0);

  const posts = postsByDays[displayedDays];

  async function loadDays(nextDays: PopularPeriod) {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    const cachedPosts = postsByDays[nextDays];
    if (cachedPosts !== undefined) {
      setDisplayedDays(nextDays);
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
      const isStaleRequest = latestRequestIdRef.current !== requestId;

      setPostsByDays((current) => ({ ...current, [nextDays]: nextPosts }));
      setFailedDays((current) => {
        const next = { ...current };
        delete next[nextDays];

        return next;
      });
      if (isStaleRequest) {
        return;
      }

      setDisplayedDays(nextDays);
      setErrorMessage(null);
    } catch {
      const isStaleRequest = latestRequestIdRef.current !== requestId;

      setFailedDays((current) => ({ ...current, [nextDays]: true }));
      if (isStaleRequest) {
        return;
      }

      setErrorMessage(FETCH_ERROR_MESSAGE);
    } finally {
      if (latestRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    if (selectedDays === undefined) {
      return;
    }

    const isDaysChanged = prevControlledDaysRef.current !== selectedDays;
    const isRetryRequested = prevReloadTokenRef.current !== reloadToken;

    prevControlledDaysRef.current = selectedDays;
    prevReloadTokenRef.current = reloadToken;

    if (!isDaysChanged && !isRetryRequested) {
      return;
    }

    if (postsByDays[selectedDays] !== undefined) {
      latestRequestIdRef.current += 1;
      setIsLoading(false);
      setDisplayedDays(selectedDays);
      setErrorMessage(null);

      return;
    }

    if (!isDaysChanged && !failedDays[selectedDays]) {
      return;
    }

    void loadDays(selectedDays);
  }, [failedDays, postsByDays, reloadToken, selectedDays]);

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
