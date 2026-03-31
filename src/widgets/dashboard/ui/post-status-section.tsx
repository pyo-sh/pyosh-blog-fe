"use client";

import { Icon } from "@iconify/react";
import archiveLinear from "@iconify-icons/solar/archive-linear";
import checkCircleLinear from "@iconify-icons/solar/check-circle-linear";
import documentTextLinear from "@iconify-icons/solar/document-text-linear";
import penNewRoundLinear from "@iconify-icons/solar/pen-new-round-linear";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchDashboardStats } from "@entities/stat";
import { formatNumber } from "@shared/lib/format-number";
import { Skeleton } from "@shared/ui/libs";

function PostStatusSkeleton() {
  return (
    <div aria-busy="true" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-border-4 bg-background-2 p-5"
        >
          <div className="flex items-center gap-2">
            <Skeleton height="1rem" width="1rem" />
            <Skeleton height="1rem" width="4rem" />
          </div>
          <div className="mt-5">
            <Skeleton height="1.75rem" width="3rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PostStatusError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-negative-1/20 bg-background-2 px-4 py-4">
      <p className="text-sm text-negative-1">
        글 상태 데이터를 불러오지 못했습니다.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex rounded-lg border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
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

  if (isLoading) {
    return <PostStatusSkeleton />;
  }

  if (isError) {
    return <PostStatusError onRetry={() => void refetch()} />;
  }

  if (!data) {
    return null;
  }

  const statusCards = [
    {
      label: "전체 게시글",
      href: "/manage/posts",
      icon: documentTextLinear,
      iconClassName: "text-text-1",
      badgeClassName: "text-text-3",
      valueClassName: "text-text-1",
      value: data.totalPosts,
    },
    {
      label: "작성중",
      href: "/manage/posts?status=draft",
      icon: penNewRoundLinear,
      iconClassName: "text-grey-3",
      badgeClassName:
        "rounded-md bg-grey-3/10 px-2 py-0.5 text-[0.75rem] font-medium text-grey-3",
      valueClassName: "text-grey-3",
      value: data.postsByStatus.draft,
    },
    {
      label: "발행됨",
      href: "/manage/posts?status=published",
      icon: checkCircleLinear,
      iconClassName: "text-positive-1",
      badgeClassName:
        "rounded-md bg-positive-1/10 px-2 py-0.5 text-[0.75rem] font-medium text-positive-1",
      valueClassName: "text-positive-1",
      value: data.postsByStatus.published,
    },
    {
      label: "보관됨",
      href: "/manage/posts?status=archived",
      icon: archiveLinear,
      iconClassName: "text-yellow-1",
      badgeClassName:
        "rounded-md bg-yellow-1/10 px-2 py-0.5 text-[0.75rem] font-medium text-yellow-1",
      valueClassName: "text-yellow-1",
      value: data.postsByStatus.archived,
    },
  ] as const;

  return (
    <section
      aria-label="글 상태 요약"
      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
    >
      {statusCards.map(
        ({
          label,
          href,
          icon,
          iconClassName,
          badgeClassName,
          valueClassName,
          value,
        }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-border-4 bg-background-2 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-1/40"
          >
            <div className="flex items-center gap-2">
              <Icon
                icon={icon}
                width="18"
                aria-hidden="true"
                className={iconClassName}
              />
              <span className={badgeClassName}>{label}</span>
            </div>
            <p
              className={`mt-5 text-[1.75rem] font-bold leading-none ${valueClassName}`}
              style={{ fontFamily: "Outfit, 'Gothic A1', sans-serif" }}
            >
              {formatNumber(value)}
            </p>
          </Link>
        ),
      )}
    </section>
  );
}
