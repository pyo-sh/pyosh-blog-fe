"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, type DashboardStats } from "@entities/stat";
import { cn } from "@shared/lib/style-utils";

const numberFormatter = new Intl.NumberFormat("ko-KR");

const quickActions = [
  {
    label: "게시글 관리",
    description: "게시글 목록을 열고 상태를 점검합니다.",
    availability: "연결 예정",
  },
  {
    label: "댓글 관리",
    description: "최근 댓글을 확인하고 대응 흐름으로 이동합니다.",
    availability: "연결 예정",
  },
  {
    label: "카테고리 관리",
    description: "카테고리 구조와 노출 상태를 정리합니다.",
    availability: "연결 예정",
  },
  {
    label: "새 글 작성",
    description: "작성 화면 진입 경로를 위한 자리입니다.",
    availability: "준비 중",
  },
] as const;

type StatCard = {
  label: string;
  value: number;
  description: string;
};

function formatStatValue(value: number) {
  return numberFormatter.format(value);
}

function mapStatsToCards(stats: DashboardStats): StatCard[] {
  return [
    {
      label: "오늘 조회수",
      value: stats.todayPageviews,
      description: "오늘 발생한 페이지 조회수",
    },
    {
      label: "주간 조회수",
      value: stats.weekPageviews,
      description: "최근 7일 누적 페이지 조회수",
    },
    {
      label: "월간 조회수",
      value: stats.monthPageviews,
      description: "최근 30일 누적 페이지 조회수",
    },
    {
      label: "총 게시글",
      value: stats.totalPosts,
      description: "현재 등록된 전체 게시글 수",
    },
    {
      label: "총 댓글",
      value: stats.totalComments,
      description: "현재 누적된 전체 댓글 수",
    },
  ];
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.5rem] border border-border-3 bg-background-2 p-5"
        >
          <div className="h-4 w-20 rounded-full bg-background-4" />
          <div className="mt-5 h-10 w-24 rounded-full bg-background-4" />
          <div className="mt-4 h-4 w-full rounded-full bg-background-4" />
        </div>
      ))}
    </div>
  );
}

function DashboardStatCard({ label, value, description }: StatCard) {
  return (
    <article className="rounded-[1.5rem] border border-border-3 bg-background-2 p-5 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)]">
      <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
        {label}
      </p>
      <p className="mt-4 text-[2rem] font-semibold leading-none text-text-1">
        {formatStatValue(value)}
      </p>
      <p className="mt-3 text-body-sm text-text-3">{description}</p>
    </article>
  );
}

function DashboardStatsError({ message }: { message: string }) {
  return (
    <div className="rounded-[1.5rem] border border-negative-1/30 bg-negative-1/5 p-5">
      <p className="text-body-xs uppercase tracking-[0.2em] text-negative-1">
        Stats unavailable
      </p>
      <p className="mt-3 text-body-md text-text-2">{message}</p>
    </div>
  );
}

function DashboardStatsSection() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Admin overview
          </p>
          <div className="space-y-2">
            <h1 className="text-heading-md text-text-1">대시보드</h1>
            <p className="max-w-3xl text-body-md text-text-3">
              핵심 지표를 먼저 확인하고, 최근 댓글과 주요 관리 경로로 바로
              이동할 수 있는 관리자 홈 화면입니다.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center justify-center rounded-[3px] border border-border-3 bg-background-1 px-4 py-2 text-body-sm font-medium text-text-4">
          상세 통계 페이지 준비 중
        </div>
      </div>

      {isLoading ? <DashboardStatsSkeleton /> : null}

      {isError ? (
        <DashboardStatsError
          message={
            error instanceof Error
              ? error.message
              : "통계 데이터를 불러오지 못했습니다."
          }
        />
      ) : null}

      {data ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {mapStatsToCards(data).map((card) => (
            <DashboardStatCard key={card.label} {...card} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function RecentCommentsSection() {
  return (
    <section className="rounded-[1.5rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
            Recent comments
          </p>
          <h2 className="mt-2 text-xl font-semibold text-text-1">최신 댓글</h2>
        </div>
        <span className="rounded-full border border-border-2 px-3 py-1 text-body-xs text-text-3">
          준비 중
        </span>
      </div>

      <div className="mt-6 rounded-[1rem] border border-dashed border-border-3 bg-background-1 p-5">
        <p className="text-body-md font-medium text-text-1">
          아직 연결된 최신 댓글 데이터가 없습니다.
        </p>
        <p className="mt-2 text-body-sm text-text-3">
          댓글 관리 API와 목록 화면이 준비되면 이 영역에 실제 최근 댓글이
          표시됩니다.
        </p>
      </div>
    </section>
  );
}

function QuickActionsSection() {
  return (
    <section className="rounded-[1.5rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)]">
      <div>
        <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
          Quick actions
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-1">빠른 이동</h2>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => (
          <div
            key={action.label}
            className={cn(
              "rounded-[1rem] border border-border-3 bg-background-1 p-4 transition-colors",
              "cursor-not-allowed opacity-70",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-body-md font-medium text-text-1">
                {action.label}
              </p>
              <span className="rounded-full border border-border-2 px-2.5 py-1 text-body-xs text-text-4">
                {action.availability}
              </span>
            </div>
            <p className="mt-3 text-body-sm text-text-3">
              {action.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardHome() {
  return (
    <div className="space-y-8">
      <DashboardStatsSection />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RecentCommentsSection />
        <QuickActionsSection />
      </div>
    </div>
  );
}
