"use client";

import { Icon } from "@iconify/react";
import chart2Linear from "@iconify-icons/solar/chart-2-linear";
import eyeLinear from "@iconify-icons/solar/eye-linear";
import graphUpLinear from "@iconify-icons/solar/graph-up-linear";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@entities/stat";
import { fetchDashboardStats } from "@entities/stat";
import { formatNumber } from "@shared/lib/format-number";
import { Skeleton } from "@shared/ui/libs";

function StatsSkeleton() {
  return (
    <div aria-busy="true" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-border-4 bg-background-2 p-5"
        >
          <Skeleton
            height="2.5rem"
            width="2.5rem"
            className="rounded-[0.625rem]"
          />
          <div className="mt-5">
            <Skeleton height="1.75rem" width="5rem" />
          </div>
          <div className="mt-3">
            <Skeleton height="0.875rem" width="4.5rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-negative-1/20 bg-background-2 p-5">
      <p className="text-sm text-negative-1">
        통계 데이터를 불러오지 못했습니다.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex rounded-lg border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
      >
        다시 시도
      </button>
    </div>
  );
}

const STAT_CARDS = [
  {
    key: "todayPageviews" as const,
    label: "오늘 조회수",
    icon: eyeLinear,
    iconClassName: "bg-primary-1/10 text-primary-1",
    valueClassName: "text-text-1",
  },
  {
    key: "weekPageviews" as const,
    label: "주간 조회수",
    icon: chart2Linear,
    iconClassName: "bg-info-1/10 text-info-1",
    valueClassName: "text-text-1",
  },
  {
    key: "monthPageviews" as const,
    label: "월간 조회수",
    icon: graphUpLinear,
    iconClassName: "bg-info-2/10 text-info-2",
    valueClassName: "text-text-1",
  },
] as const;

export function StatsSection({
  dataOverride,
}: {
  dataOverride?: DashboardStats;
}) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    enabled: dataOverride === undefined,
    initialData: dataOverride,
  });

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (isError) {
    return <StatsError onRetry={() => void refetch()} />;
  }

  if (!data) {
    return null;
  }

  return (
    <section
      aria-label="조회수 통계"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {STAT_CARDS.map(({ key, label, icon, iconClassName, valueClassName }) => (
        <article
          key={key}
          className="rounded-xl border border-border-4 bg-background-2 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-3"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-[0.625rem] ${iconClassName}`}
          >
            <Icon icon={icon} width="22" aria-hidden="true" />
          </div>
          <p
            className={`mt-5 text-[1.75rem] font-bold leading-none ${valueClassName}`}
            style={{ fontFamily: "Outfit, 'Gothic A1', sans-serif" }}
          >
            {formatNumber(data[key])}
          </p>
          <p className="mt-3 text-[0.8125rem] text-text-3">{label}</p>
        </article>
      ))}
    </section>
  );
}
