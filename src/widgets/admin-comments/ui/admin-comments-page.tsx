"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminDeleteComment,
  fetchAdminComments,
  type AdminCommentItem,
} from "@entities/comment";
import { ApiResponseError } from "@shared/api";
import { cn } from "@shared/lib/style-utils";
import { EmptyState, Skeleton, Spinner } from "@shared/ui/libs";

const PAGE_SIZE = 10;
const QUERY_KEY = ["admin-comments"] as const;

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const statusLabelMap: Record<AdminCommentItem["status"], string> = {
  active: "정상",
  deleted: "삭제됨",
  hidden: "숨김",
};

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function getQueryKey(page: number) {
  return [...QUERY_KEY, page] as const;
}

function getAuthorTypeLabel(item: AdminCommentItem) {
  return item.author.type === "oauth" ? "회원" : "비회원";
}

function getBodyPreview(item: AdminCommentItem) {
  if (item.status === "deleted") {
    return "관리자에 의해 삭제된 댓글입니다.";
  }

  return item.body;
}

function canExpandBody(body: string) {
  return body.length > 80 || body.includes("\n");
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
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

function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-[0.75rem] border border-negative-1/30 px-3 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}


export function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedCommentId, setExpandedCommentId] = useState<number | null>(
    null,
  );

  const queryKey = getQueryKey(page);
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminComments({
        page,
        limit: PAGE_SIZE,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteComment,
    onSuccess: async () => {
      setActionError(null);
      setPage((currentPage) =>
        currentPage > 1 && rows.length === 1 ? currentPage - 1 : currentPage,
      );
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (mutationError) => {
      setActionError(
        getErrorMessage(mutationError, "댓글 삭제에 실패했습니다."),
      );
    },
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  useEffect(() => {
    setExpandedCommentId(null);
  }, [page]);

  const paginationLabel = useMemo(() => {
    if (!meta || rows.length === 0) {
      return "표시할 댓글이 없습니다.";
    }

    const start = (meta.page - 1) * meta.limit + 1;
    const end = start + rows.length - 1;

    return `총 ${meta.total}개 중 ${start}-${end}`;
  }, [meta, rows.length]);

  const activeActionId = deleteMutation.variables ?? null;
  const isActionPending = deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Comments
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-text-1">댓글 관리</h1>
          <p className="mt-2 text-sm text-text-3">
            공개 댓글과 비밀 댓글을 함께 확인하고, 상태를 검토한 뒤 필요한
            항목을 강제로 삭제할 수 있습니다.
          </p>
        </div>

        <span className="inline-flex items-center justify-center rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm font-medium text-text-4">
          페이지당 {PAGE_SIZE}개
        </span>
      </header>

      <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
        <div className="flex flex-col gap-3 border-b border-border-3 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-1">댓글 목록</h2>
            <p className="mt-1 text-sm text-text-3">
              최신 순으로 댓글을 살펴보고 비밀 여부, 상태, 답글 관계를 함께
              확인할 수 있습니다.
            </p>
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
          {isPending ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-2">
              <div className="grid grid-cols-[minmax(10rem,1fr)_minmax(16rem,2.4fr)_0.8fr_0.9fr_0.9fr_0.8fr] gap-4 border-b border-border-3 px-6 py-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
              <div className="space-y-4 px-6 py-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rect" height="2.5rem" className="rounded-[1rem]" />
                ))}
              </div>
            </div>
          ) : null}

          {!isPending && isError ? (
            <div className="rounded-[1.5rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8 text-center">
              <p className="text-sm text-negative-1">
                {getErrorMessage(error, "댓글 목록을 불러오지 못했습니다.")}
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
                        <th className="px-6 py-4 font-medium">작성자</th>
                        <th className="px-6 py-4 font-medium">내용</th>
                        <th className="px-6 py-4 font-medium">비밀 여부</th>
                        <th className="px-6 py-4 font-medium">상태</th>
                        <th className="px-6 py-4 font-medium">작성일</th>
                        <th className="px-6 py-4 font-medium">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-3">
                      {rows.map((item) => {
                        const disabled =
                          isActionPending && activeActionId === item.id;
                        const isDeleted = item.status === "deleted";
                        const bodyPreview = getBodyPreview(item);
                        const expanded = expandedCommentId === item.id;
                        const expandable =
                          !isDeleted && canExpandBody(bodyPreview);

                        return (
                          <tr key={item.id} className="align-top">
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-2">
                                <span className="font-medium text-text-1">
                                  {item.author.name}
                                </span>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-text-4">
                                  <span>{getAuthorTypeLabel(item)}</span>
                                  {item.depth > 0 ? (
                                    <Badge tone="neutral">답글</Badge>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="max-w-2xl space-y-2">
                                <p
                                  className={cn(
                                    "text-sm text-text-2",
                                    expanded
                                      ? "whitespace-pre-wrap break-words"
                                      : "truncate",
                                  )}
                                >
                                  {bodyPreview}
                                </p>
                                {item.replyToName ? (
                                  <p className="text-xs text-text-4">
                                    @{item.replyToName} 에 대한 답글
                                  </p>
                                ) : null}
                                {expandable ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedCommentId((current) =>
                                        current === item.id ? null : item.id,
                                      )
                                    }
                                    className="text-xs font-medium text-primary-1 transition-colors hover:text-primary-2"
                                  >
                                    {expanded ? "접기" : "전체 보기"}
                                  </button>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <Badge
                                tone={item.isSecret ? "primary" : "neutral"}
                              >
                                {item.isSecret ? "비밀글" : "공개"}
                              </Badge>
                            </td>
                            <td className="px-6 py-5">
                              <Badge
                                tone={
                                  item.status === "active"
                                    ? "warning"
                                    : item.status === "hidden"
                                      ? "neutral"
                                      : "danger"
                                }
                              >
                                {statusLabelMap[item.status]}
                              </Badge>
                            </td>
                            <td className="px-6 py-5 text-sm text-text-2">
                              {formatDate(item.createdAt)}
                            </td>
                            <td className="px-6 py-5">
                              {isDeleted ? (
                                <span className="inline-flex items-center rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm text-text-4">
                                  삭제됨
                                </span>
                              ) : (
                                <ActionButton
                                  disabled={disabled}
                                  onClick={() => deleteMutation.mutate(item.id)}
                                >
                                  {disabled ? <><Spinner size="sm" /> 삭제 중</> : "삭제"}
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
              <EmptyState message="현재 등록된 댓글이 없습니다." />
            )
          ) : null}
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-4 border-t border-border-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-4">{paginationLabel}</p>

            <nav
              aria-label="관리자 댓글 페이지네이션"
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
