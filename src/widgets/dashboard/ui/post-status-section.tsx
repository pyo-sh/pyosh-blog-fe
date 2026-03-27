"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchDashboardStats } from "@entities/stat";
import { formatNumber } from "@shared/lib/format-number";
import { Skeleton } from "@shared/ui/libs";

function PostStatusSkeleton() {
  return (
    <div aria-busy="true" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1.25rem] border border-border-3 bg-background-1 p-4"
        >
          <Skeleton height="0.875rem" width="3rem" />
          <div className="mt-3">
            <Skeleton height="2rem" width="4rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PostStatusError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[1.25rem] border border-negative-1/30 bg-negative-1/5 px-4 py-3">
      <p className="text-sm text-negative-1">
        글 상태 데이터를 불러오지 못했습니다.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex rounded-[0.75rem] border border-negative-1/20 px-3 py-1.5 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
      >
        다시 시도
      </button>
    </div>
  );
}

export function PostStatusSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  const STATUS_CARDS = [
    {
      label: "전체",
      href: "/manage/posts",
      getValue: () => data?.totalPosts ?? 0,
    },
    {
      label: "초안",
      href: "/manage/posts?status=draft",
      getValue: () => data?.postsByStatus.draft ?? 0,
    },
    {
      label: "발행",
      href: "/manage/posts?status=published",
      getValue: () => data?.postsByStatus.published ?? 0,
    },
    {
      label: "보관",
      href: "/manage/posts?status=archived",
      getValue: () => data?.postsByStatus.archived ?? 0,
    },
  ] as const;

  return (
    <section aria-labelledby="post-status-heading" className="space-y-4">
      <h2
        id="post-status-heading"
        className="text-body-xs uppercase tracking-[0.24em] text-text-4"
      >
        글 상태 요약
      </h2>

      {isLoading ? <PostStatusSkeleton /> : null}
      {isError ? <PostStatusError onRetry={() => void refetch()} /> : null}

      {data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_CARDS.map(({ label, href, getValue }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-[1.25rem] border border-border-3 bg-background-2 p-4 transition-colors hover:border-primary-1/40 hover:bg-background-3"
            >
              <p className="text-body-xs text-text-4">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-text-1">
                {formatNumber(getValue())}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
