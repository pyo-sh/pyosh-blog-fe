"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentDetailModal } from "./comment-detail-modal";
import { CommentFilters } from "./comment-filters";
import { CommentTable } from "./comment-table";
import type {
  CommentStatusFilter,
  CommentAuthorTypeFilter,
} from "./comment-filters";
import { fetchAdminComments, type AdminCommentItem } from "@entities/comment";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { EmptyState, Skeleton } from "@shared/ui/libs";

const PAGE_SIZE = 10;
const QUERY_KEY = ["admin-comments"] as const;

interface FilterState {
  status: CommentStatusFilter;
  authorType: CommentAuthorTypeFilter;
  postId: number | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
}

export function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    authorType: "all",
    postId: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  const [dateError, setDateError] = useState<string | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openedComment, setOpenedComment] = useState<AdminCommentItem | null>(
    null,
  );

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status: filters.status !== "all" ? filters.status : undefined,
      authorType: filters.authorType !== "all" ? filters.authorType : undefined,
      postId: filters.postId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    [page, filters],
  );

  const queryKey = useMemo(
    () => [...QUERY_KEY, queryParams] as const,
    [queryParams],
  );

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchAdminComments(queryParams),
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const paginationLabel = useMemo(() => {
    if (!meta || rows.length === 0) return "표시할 댓글이 없습니다.";

    const start = (meta.page - 1) * meta.limit + 1;
    const end = start + rows.length - 1;

    return `총 ${meta.total}개 중 ${start}-${end}`;
  }, [meta, rows.length]);

  function handleFilterChange(partial: Partial<FilterState>) {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  }

  function handleDateChange(
    start: string | undefined,
    end: string | undefined,
  ) {
    if (start && end && start > end) {
      setDateError("시작일이 종료일보다 늦을 수 없습니다.");

      return;
    }

    setDateError(undefined);
    handleFilterChange({ startDate: start, endDate: end });
  }

  function handleToggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  const handleToggleSelectPage = useCallback(
    (ids: number[]) => {
      const allSelected = ids.every((id) => selectedIds.has(id));

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (allSelected) {
          ids.forEach((id) => next.delete(id));
        } else {
          ids.forEach((id) => next.add(id));
        }

        return next;
      });
    },
    [selectedIds],
  );

  const currentPageIds = rows.map((r) => r.id);
  const selectedOnCurrentPage = currentPageIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const selectedOnOtherPages = selectedIds.size - selectedOnCurrentPage;

  function handleClearSelection() {
    setSelectedIds(new Set());
  }

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
        {/* Filters */}
        <div className="mb-5 border-b border-border-3 pb-5">
          <CommentFilters
            status={filters.status}
            authorType={filters.authorType}
            postId={filters.postId}
            startDate={filters.startDate}
            endDate={filters.endDate}
            dateError={dateError}
            onStatusChange={(v) => handleFilterChange({ status: v })}
            onAuthorTypeChange={(v) => handleFilterChange({ authorType: v })}
            onPostChange={(id) => handleFilterChange({ postId: id })}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Bulk selection bar */}
        {selectedIds.size > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[1rem] border border-primary-1/20 bg-primary-1/5 px-4 py-3">
            <span className="text-sm font-medium text-text-1">
              선택됨 {selectedIds.size}개
              {selectedOnOtherPages > 0 ? (
                <span className="ml-1 text-text-3">
                  (다른 페이지 {selectedOnOtherPages}개 포함)
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={() => handleToggleSelectPage(currentPageIds)}
              className="rounded-[0.6rem] border border-border-3 px-3 py-1.5 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
            >
              현재 페이지 전체 선택
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="rounded-[0.6rem] px-3 py-1.5 text-sm text-text-4 transition-colors hover:text-text-2"
            >
              전체 해제
            </button>
          </div>
        ) : null}

        {/* Table header */}
        <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
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

        {/* Loading skeleton */}
        {isPending ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-2">
            <div className="grid grid-cols-7 gap-4 border-b border-border-3 px-6 py-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
            <div className="space-y-4 px-6 py-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rect"
                  height="2.5rem"
                  className="rounded-[1rem]"
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Error */}
        {!isPending && isError ? (
          <div className="rounded-[1.5rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8 text-center">
            <p className="text-sm text-negative-1">
              {getErrorMessage(error, "댓글 목록을 불러오지 못했습니다.")}
            </p>
            <button
              type="button"
              onClick={() => void queryClient.invalidateQueries({ queryKey })}
              className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {/* Table */}
        {!isPending && !isError ? (
          rows.length > 0 ? (
            <CommentTable
              rows={rows}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectPage={handleToggleSelectPage}
              onClickComment={setOpenedComment}
            />
          ) : (
            <EmptyState message="현재 등록된 댓글이 없습니다." />
          )
        ) : null}

        {/* Pagination */}
        {meta && meta.totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-4 border-t border-border-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-4">{paginationLabel}</p>

            <nav
              aria-label="관리자 댓글 페이지네이션"
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setPage((v) => Math.max(1, v - 1))}
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
                onClick={() => setPage((v) => Math.min(meta.totalPages, v + 1))}
                disabled={page === meta.totalPages}
                className="inline-flex rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </nav>
          </div>
        ) : null}
      </section>

      {/* Detail modal */}
      <CommentDetailModal
        comment={openedComment}
        isOpen={openedComment !== null}
        onClose={() => setOpenedComment(null)}
      />
    </div>
  );
}
