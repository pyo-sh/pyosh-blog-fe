"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePost,
  fetchAdminPosts,
  restorePost,
  type Post,
} from "@entities/post";
import { ApiResponseError } from "@shared/api";
import { cn } from "@shared/lib/style-utils";

const PAGE_SIZE = 10;

type AdminPostStatusFilter = Post["status"] | "all";

const STATUS_OPTIONS: Array<{
  label: string;
  value: AdminPostStatusFilter;
}> = [
  { label: "전체", value: "all" },
  { label: "초안", value: "draft" },
  { label: "발행", value: "published" },
  { label: "보관", value: "archived" },
];

const statusLabelMap: Record<Post["status"], string> = {
  draft: "초안",
  published: "발행",
  archived: "보관",
};

const visibilityLabelMap: Record<Post["visibility"], string> = {
  public: "공개",
  private: "비공개",
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

function getQueryKey(
  page: number,
  status: AdminPostStatusFilter,
  includeDeleted: boolean,
) {
  return ["admin-posts", page, status, includeDeleted] as const;
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "neutral" | "primary" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-background-3 text-text-2",
        tone === "primary" && "bg-primary-1/10 text-primary-1",
        tone === "warning" && "bg-positive-1/10 text-positive-1",
        tone === "danger" && "bg-negative-1/10 text-negative-1",
      )}
    >
      {children}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-2">
      <div className="grid grid-cols-[minmax(0,2.4fr)_0.8fr_0.8fr_0.9fr_0.8fr] gap-4 border-b border-border-3 px-6 py-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-4 animate-pulse rounded-full bg-background-4"
          />
        ))}
      </div>
      <div className="space-y-4 px-6 py-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-[1rem] bg-background-3"
          />
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-[0.75rem] border px-3 py-2 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        tone === "default" &&
          "border-border-3 text-text-2 hover:border-border-2 hover:text-text-1",
        tone === "danger" &&
          "border-negative-1/30 text-negative-1 hover:bg-negative-1/10",
      )}
    >
      {children}
    </button>
  );
}

export default function DashboardPostsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminPostStatusFilter>("all");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = getQueryKey(page, status, includeDeleted);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminPosts({
        page,
        limit: PAGE_SIZE,
        status: status === "all" ? undefined : status,
        includeDeleted,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (mutationError) => {
      setActionError(getErrorMessage(mutationError, "글 삭제에 실패했습니다."));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restorePost,
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (mutationError) => {
      setActionError(getErrorMessage(mutationError, "글 복원에 실패했습니다."));
    },
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const paginationLabel = useMemo(() => {
    if (!meta || rows.length === 0) {
      return "표시할 글이 없습니다.";
    }

    const start = (meta.page - 1) * meta.limit + 1;
    const end = start + rows.length - 1;

    return `총 ${meta.total}개 중 ${start}-${end}`;
  }, [meta, rows.length]);

  const activeActionId =
    deleteMutation.variables ?? restoreMutation.variables ?? null;
  const isActionPending =
    deleteMutation.isPending || restoreMutation.isPending || false;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Content
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-text-1">글 관리</h1>
          <p className="mt-2 text-sm text-text-3">
            상태별 글을 조회하고 삭제 또는 복원할 수 있습니다. 작성과 편집
            화면은 다음 이슈에서 연결됩니다.
          </p>
        </div>

        <span className="inline-flex items-center justify-center rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm font-medium text-text-4">
          새 글 작성 준비 중
        </span>
      </header>

      <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-text-2">
              <span className="font-medium text-text-1">상태</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as AdminPostStatusFilter);
                  setPage(1);
                }}
                className="min-w-44 rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-2">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(event) => {
                  setIncludeDeleted(event.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-border-3"
              />
              삭제된 글 포함
            </label>
          </div>

          <p className="text-sm text-text-4">
            {isFetching && !isPending
              ? "목록을 새로 불러오는 중..."
              : paginationLabel}
          </p>
        </div>

        {actionError ? (
          <div className="mt-4 rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-sm text-negative-1">
            {actionError}
          </div>
        ) : null}

        <div className="mt-6">
          {isPending ? <TableSkeleton /> : null}

          {!isPending && isError ? (
            <div className="rounded-[1.5rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8 text-center">
              <p className="text-sm text-negative-1">
                {getErrorMessage(error, "글 목록을 불러오지 못했습니다.")}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
              >
                다시 시도
              </button>
            </div>
          ) : null}

          {!isPending && !isError ? (
            rows.length > 0 ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-border-3">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-background-2">
                    <thead className="bg-background-1 text-left text-xs uppercase tracking-[0.18em] text-text-4">
                      <tr>
                        <th className="px-6 py-4 font-medium">제목</th>
                        <th className="px-6 py-4 font-medium">상태</th>
                        <th className="px-6 py-4 font-medium">가시성</th>
                        <th className="px-6 py-4 font-medium">작성일</th>
                        <th className="px-6 py-4 font-medium">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-3">
                      {rows.map((post) => {
                        const deleted = Boolean(post.deletedAt);
                        const disabled =
                          isActionPending && activeActionId === post.id;

                        return (
                          <tr key={post.id} className="align-top">
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-2">
                                <span className="font-medium text-text-1">
                                  {post.title}
                                </span>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-text-4">
                                  <span>{post.category.name}</span>
                                  {deleted ? (
                                    <Badge tone="danger">삭제됨</Badge>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <Badge
                                tone={
                                  post.status === "published"
                                    ? "primary"
                                    : post.status === "draft"
                                      ? "warning"
                                      : "neutral"
                                }
                              >
                                {statusLabelMap[post.status]}
                              </Badge>
                            </td>
                            <td className="px-6 py-5">
                              <Badge
                                tone={
                                  post.visibility === "public"
                                    ? "primary"
                                    : "neutral"
                                }
                              >
                                {visibilityLabelMap[post.visibility]}
                              </Badge>
                            </td>
                            <td className="px-6 py-5 text-sm text-text-2">
                              {formatDate(post.createdAt)}
                            </td>
                            <td className="px-6 py-5">
                              {deleted ? (
                                <ActionButton
                                  disabled={disabled}
                                  onClick={() =>
                                    restoreMutation.mutate(post.id)
                                  }
                                >
                                  {disabled ? "복원 중..." : "복원"}
                                </ActionButton>
                              ) : (
                                <ActionButton
                                  disabled={disabled}
                                  onClick={() => deleteMutation.mutate(post.id)}
                                  tone="danger"
                                >
                                  {disabled ? "삭제 중..." : "삭제"}
                                </ActionButton>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border-3 bg-background-1 px-6 py-12 text-center">
                <p className="text-sm text-text-3">
                  현재 조건에 맞는 글이 없습니다.
                </p>
              </div>
            )
          ) : null}
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-4 border-t border-border-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-4">{paginationLabel}</p>

            <nav
              aria-label="관리자 글 페이지네이션"
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="inline-flex rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>

              <span className="min-w-20 text-center text-sm text-text-2">
                {page} / {meta.totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(meta.totalPages, value + 1))
                }
                disabled={page === meta.totalPages}
                className="inline-flex rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </nav>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
