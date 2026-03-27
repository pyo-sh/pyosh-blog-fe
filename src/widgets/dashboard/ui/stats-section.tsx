"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@entities/stat";
import { Skeleton } from "@shared/ui/libs";

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatStatValue(value: number) {
  return numberFormatter.format(value);
}

function StatsSkeleton() {
  return (
    <div aria-busy="true" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1.5rem] border border-border-3 bg-background-2 p-5"
        >
          <Skeleton height="1rem" width="5rem" />
          <div className="mt-5">
            <Skeleton height="2.5rem" width="6rem" />
          </div>
          <div className="mt-4">
            <Skeleton />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[1.5rem] border border-negative-1/30 bg-negative-1/5 p-5">
      <p className="text-body-xs uppercase tracking-[0.2em] text-negative-1">
        Stats unavailable
      </p>
      <p className="mt-3 text-body-md text-text-2">
        통계 데이터를 불러오지 못했습니다.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
      >
        다시 시도
      </button>
    </div>
  );
}

const STAT_CARDS = [
  {
    key: "todayPageviews" as const,
    description: "오늘 발생한 페이지 조회수",
    sublabel: "오늘",
  },
  {
    key: "weekPageviews" as const,
    description: "최근 7일 누적 페이지 조회수",
    sublabel: "최근 7일",
  },
  {
    key: "monthPageviews" as const,
    description: "최근 30일 누적 페이지 조회수",
    sublabel: "최근 30일",
  },
] as const;

export function StatsSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  return (
    <section aria-labelledby="stats-heading" className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Admin overview
          </p>
          <div className="space-y-2">
            <h1 id="stats-heading" className="text-h2 text-text-1">
              대시보드
            </h1>
            <p className="max-w-3xl text-body-md text-text-3">
              핵심 지표를 먼저 확인하고, 최근 댓글과 주요 관리 경로로 바로
              이동할 수 있는 관리자 홈 화면입니다.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? <StatsSkeleton /> : null}
      {isError ? <StatsError onRetry={() => void refetch()} /> : null}

      {data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STAT_CARDS.map(({ key, description, sublabel }) => (
            <article
              key={key}
              className="rounded-[1.5rem] border border-border-3 bg-background-2 p-5 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)]"
            >
              <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
                {sublabel}
              </p>
              <p className="mt-4 text-[2rem] font-semibold leading-none text-text-1">
                {formatStatValue(data[key])}
              </p>
              <p className="mt-3 text-body-sm text-text-3">{description}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
