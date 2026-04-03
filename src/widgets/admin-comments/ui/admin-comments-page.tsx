"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CommentDeleteModal,
  type CommentManageAction,
} from "./comment-delete-modal";
import { CommentDetailModal } from "./comment-detail-modal";
import { CommentFilters } from "./comment-filters";
import { CommentTable } from "./comment-table";
import type {
  CommentStatusFilter,
  CommentAuthorTypeFilter,
} from "./comment-filters";
import {
  adminBulkOperateComments,
  adminDeleteComment,
  adminRestoreComment,
  fetchAdminCommentThread,
  fetchAdminComments,
  type AdminCommentItem,
} from "@entities/comment";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";
import { EmptyState, Skeleton } from "@shared/ui/libs";

const PAGE_SIZE = 10;
const QUERY_KEY = ["admin-comments"] as const;
const EMPTY_COMMENT_ROWS: AdminCommentItem[] = [];

interface FilterState {
  status: CommentStatusFilter;
  authorType: CommentAuthorTypeFilter;
  postId: number | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
}

type SelectedCommentMap = Record<number, AdminCommentItem>;
type ActionContext =
  | {
      type: "single";
      item: AdminCommentItem;
      defaultAction?: CommentManageAction;
    }
  | {
      type: "bulk";
      items: AdminCommentItem[];
      defaultAction?: CommentManageAction;
    }
  | null;

function getAllowedActionsForStatus(status: AdminCommentItem["status"]) {
  if (status === "deleted") {
    return ["restore", "hard_delete"] as const;
  }

  if (status === "hidden") {
    return ["restore", "soft_delete", "hard_delete"] as const;
  }

  return ["soft_delete", "hard_delete"] as const;
}

function getBulkAllowedActions(items: AdminCommentItem[]) {
  return items.reduce<readonly CommentManageAction[]>((current, item) => {
    const allowedActions = [
      ...getAllowedActionsForStatus(item.status),
    ] as readonly CommentManageAction[];

    if (current.length === 0) {
      return [...allowedActions];
    }

    return current.filter((action) => allowedActions.includes(action));
  }, []);
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  windowSize: number,
): Array<number | "..."> {
  if (totalPages <= 1) return [];

  const windowStart = Math.max(2, currentPage - windowSize);
  const windowEnd = Math.min(totalPages - 1, currentPage + windowSize);
  const pages: Array<number | "..."> = [1];

  if (windowStart > 2) pages.push("...");

  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  if (windowEnd < totalPages - 1) pages.push("...");

  pages.push(totalPages);

  return pages;
}

export function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    authorType: "all",
    postId: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  const [dateError, setDateError] = useState<string | undefined>(undefined);
  const [selectedItems, setSelectedItems] = useState<SelectedCommentMap>({});
  const [openedComment, setOpenedComment] = useState<AdminCommentItem | null>(
    null,
  );
  const [actionContext, setActionContext] = useState<ActionContext>(null);
  const [cascadeCount, setCascadeCount] = useState<number | undefined>(
    undefined,
  );
  const cascadeRequestSeqRef = useRef(0);

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

  const rows = data?.data ?? EMPTY_COMMENT_ROWS;
  const meta = data?.meta;

  useEffect(() => {
    setSelectedItems((current) => {
      if (rows.length === 0) {
        return current;
      }

      const next = { ...current };
      let hasChanged = false;

      for (const row of rows) {
        if (next[row.id]) {
          if (next[row.id] !== row) {
            next[row.id] = row;
            hasChanged = true;
          }
        }
      }

      return hasChanged ? next : current;
    });
  }, [rows]);

  const actionMutation = useMutation({
    mutationFn: async (payload: {
      action: CommentManageAction;
      items: AdminCommentItem[];
    }) => {
      if (payload.items.length === 1) {
        const [item] = payload.items;

        if (payload.action === "restore") {
          await adminRestoreComment(item.id);
        } else {
          await adminDeleteComment(item.id, payload.action);
        }

        return;
      }

      await adminBulkOperateComments(
        payload.items.map((item) => item.id),
        payload.action,
      );
    },
    onSuccess: async (_data, variables) => {
      setActionError(null);
      setSelectedItems((current) => {
        const next = { ...current };
        for (const item of variables.items) {
          delete next[item.id];
        }

        return next;
      });
      if (
        openedComment &&
        variables.items.some((item) => item.id === openedComment.id)
      ) {
        setOpenedComment(null);
      }
      setActionContext(null);
      setCascadeCount(undefined);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      const actionLabel =
        variables.action === "restore"
          ? "복원"
          : variables.action === "hard_delete"
            ? "영구 삭제"
            : "삭제";
      toast.success(
        variables.items.length > 1
          ? `${variables.items.length}개 댓글을 ${actionLabel}했습니다.`
          : `댓글을 ${actionLabel}했습니다.`,
      );
    },
    onError: (mutationError) => {
      const message = getErrorMessage(
        mutationError,
        "댓글 처리에 실패했습니다.",
      );
      setActionError(message);
      toast.error(message);
    },
  });

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

  function handleToggleSelect(item: AdminCommentItem) {
    setSelectedItems((current) => {
      const next = { ...current };

      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = item;
      }

      return next;
    });
  }

  const handleToggleSelectPage = useCallback(
    (ids: number[]) => {
      setSelectedItems((current) => {
        const next = { ...current };
        const allSelected = ids.every((id) => next[id] !== undefined);

        if (allSelected) {
          ids.forEach((id) => {
            delete next[id];
          });
        } else {
          rows.forEach((row) => {
            if (ids.includes(row.id)) {
              next[row.id] = row;
            }
          });
        }

        return next;
      });
    },
    [rows],
  );

  const currentPageIds = rows.map((r) => r.id);
  const selectedIds = Object.keys(selectedItems).map(Number);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedOnCurrentPage = currentPageIds.filter((id) =>
    selectedIdSet.has(id),
  ).length;
  const selectedOnOtherPages = selectedIds.length - selectedOnCurrentPage;
  const selectedList = Object.values(selectedItems);

  function handleClearSelection() {
    setSelectedItems({});
  }

  const handleOpenActionModal = useCallback(
    (item: AdminCommentItem, defaultAction?: CommentManageAction) => {
      setActionError(null);
      setActionContext({ type: "single", item, defaultAction });
      setCascadeCount(undefined);
    },
    [],
  );

  const handleOpenBulkAction = useCallback(
    (defaultAction: CommentManageAction) => {
      if (selectedList.length === 0) {
        return;
      }

      const allowedActions = getBulkAllowedActions(selectedList);
      const nextDefaultAction = allowedActions.includes(defaultAction)
        ? defaultAction
        : allowedActions[0];

      if (!nextDefaultAction) {
        return;
      }

      setActionError(null);
      setActionContext({
        type: "bulk",
        items: selectedList,
        defaultAction: nextDefaultAction,
      });
      setCascadeCount(undefined);
    },
    [selectedList],
  );

  const handleCloseModal = useCallback(() => {
    setOpenedComment(null);
  }, []);

  const handleCloseActionModal = useCallback(() => {
    if (actionMutation.isPending) {
      return;
    }

    setActionContext(null);
    setCascadeCount(undefined);
  }, [actionMutation.isPending]);

  useEffect(() => {
    async function loadCascade() {
      if (!actionContext || actionContext.type !== "single") {
        cascadeRequestSeqRef.current += 1;
        setCascadeCount(undefined);

        return;
      }

      const requestSeq = ++cascadeRequestSeqRef.current;
      const targetCommentId = actionContext.item.id;

      if (actionContext.item.depth > 0) {
        if (
          cascadeRequestSeqRef.current === requestSeq &&
          actionContext.type === "single" &&
          actionContext.item.id === targetCommentId
        ) {
          setCascadeCount(0);
        }

        return;
      }

      try {
        const thread = await fetchAdminCommentThread(targetCommentId);

        if (
          cascadeRequestSeqRef.current !== requestSeq ||
          actionContext.type !== "single" ||
          actionContext.item.id !== targetCommentId
        ) {
          return;
        }

        const nextCascadeCount = thread.filter(
          (item) => item.parentId === targetCommentId,
        ).length;
        setCascadeCount(nextCascadeCount);
      } catch {
        if (
          cascadeRequestSeqRef.current === requestSeq &&
          actionContext.type === "single" &&
          actionContext.item.id === targetCommentId
        ) {
          setCascadeCount(undefined);
        }
      }
    }

    void loadCascade();
  }, [actionContext]);

  const actionModalTitle =
    actionContext?.type === "bulk" ? "댓글 일괄 작업" : "댓글 작업";
  const actionModalCount =
    actionContext?.type === "bulk" ? actionContext.items.length : 1;
  const actionModalActions =
    actionContext?.type === "bulk"
      ? getBulkAllowedActions(actionContext.items)
      : actionContext
        ? getAllowedActionsForStatus(actionContext.item.status)
        : [];
  const actionItems =
    actionContext?.type === "bulk"
      ? actionContext.items
      : actionContext
        ? [actionContext.item]
        : [];
  const isSingleActionModalOpen =
    actionContext !== null && actionContext.type === "single";
  const bulkAllowedActions = getBulkAllowedActions(selectedList);
  const pageNumbers = meta ? generatePageNumbers(page, meta.totalPages, 2) : [];

  return (
    <>
      <section
        className={cn(
          "-mx-4 -my-6 bg-background-1 px-4 py-6 md:-mx-6 md:px-6",
          selectedIds.length > 0 && "pb-24 md:pb-28",
        )}
      >
        <div className="flex flex-wrap items-end justify-start gap-3 pb-4">
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

        {actionError ? (
          <div className="mt-4 rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-sm text-negative-1">
            {actionError}
          </div>
        ) : null}

        {isPending ? (
          <div className="mt-4 overflow-hidden rounded-[1rem] border border-border-4 bg-background-1">
            <div className="grid grid-cols-8 gap-3 border-b border-border-4 bg-background-2 px-4 py-3.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
            <div className="space-y-3 px-4 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rect"
                  height="3.25rem"
                  className="rounded-[0.9rem]"
                />
              ))}
            </div>
          </div>
        ) : null}

        {!isPending && isError ? (
          <div className="mt-4 rounded-[1.25rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8 text-center">
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

        {!isPending && !isError ? (
          rows.length > 0 ? (
            <div className="mt-4">
              <CommentTable
                rows={rows}
                selectedIds={selectedIdSet}
                deletingId={
                  actionMutation.isPending && actionItems.length === 1
                    ? (actionItems[0]?.id ?? null)
                    : null
                }
                onToggleSelect={handleToggleSelect}
                onToggleSelectPage={handleToggleSelectPage}
                onClickComment={setOpenedComment}
                onManage={handleOpenActionModal}
              />
            </div>
          ) : (
            <EmptyState
              message="현재 등록된 댓글이 없습니다."
              className="mt-4"
            />
          )
        ) : null}

        {meta && meta.totalPages > 1 ? (
          <div className="mt-5 border-t border-border-4 pt-4">
            <p className="text-right text-sm text-text-4">
              {isFetching && !isPending
                ? "목록을 새로 불러오는 중..."
                : paginationLabel}
            </p>
            <nav
              aria-label="관리자 댓글 페이지네이션"
              className="mt-4 flex items-center justify-center gap-0.5"
            >
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 5))}
                disabled={page <= 5}
                className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
                aria-label="5 pages back"
              >
                &laquo;
              </button>
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
                aria-label="Previous page"
              >
                &lsaquo;
              </button>
              {pageNumbers.map((pageNumber, index) =>
                pageNumber === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-4"
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    disabled={pageNumber === page}
                    className={cn(
                      "inline-flex min-w-[2rem] items-center justify-center rounded px-2.5 py-1.5 text-sm transition-colors",
                      pageNumber === page
                        ? "pointer-events-none bg-primary-1 font-semibold text-white"
                        : "text-text-1 hover:bg-background-2",
                    )}
                    aria-current={pageNumber === page ? "page" : undefined}
                    aria-label={`Page ${pageNumber}`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(meta.totalPages, value + 1))
                }
                disabled={page === meta.totalPages}
                className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
                aria-label="Next page"
              >
                &rsaquo;
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(meta.totalPages, value + 5))
                }
                disabled={page + 5 > meta.totalPages}
                className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
                aria-label="5 pages forward"
              >
                &raquo;
              </button>
            </nav>
          </div>
        ) : meta ? (
          <div className="mt-5 border-t border-border-4 pt-4">
            <p className="text-right text-sm text-text-4">
              {isFetching && !isPending
                ? "목록을 새로 불러오는 중..."
                : paginationLabel}
            </p>
          </div>
        ) : null}
      </section>

      {selectedIds.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 md:left-[var(--admin-sidebar-offset)]">
          <div className="flex flex-wrap items-center gap-3 border-t border-border-3 bg-[rgba(241,242,243,0.95)] px-4 py-3 backdrop-blur-[12px] md:px-6 dark:bg-[rgba(19,20,21,0.94)]">
            <span className="text-sm font-medium text-text-1">
              선택됨 {selectedIds.length}개
              {selectedOnOtherPages > 0 ? (
                <span className="ml-1 text-xs text-text-3">
                  (다른 페이지 {selectedOnOtherPages}개 포함)
                </span>
              ) : null}
            </span>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedItems((current) => {
                    const next = { ...current };
                    rows.forEach((row) => {
                      next[row.id] = row;
                    });

                    return next;
                  });
                }}
                className="cursor-pointer px-2 py-1.5 text-sm text-primary-1 transition-colors hover:text-primary-1/80"
              >
                현재 페이지 전체 선택
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="cursor-pointer px-2 py-1.5 text-sm text-text-3 transition-colors hover:text-text-1"
              >
                전체 해제
              </button>
              <button
                type="button"
                onClick={() => handleOpenBulkAction("restore")}
                disabled={!bulkAllowedActions.includes("restore")}
                className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                복원
              </button>
              <button
                type="button"
                onClick={() => handleOpenBulkAction("soft_delete")}
                disabled={!bulkAllowedActions.includes("soft_delete")}
                className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                소프트 삭제
              </button>
              <button
                type="button"
                onClick={() => handleOpenBulkAction("hard_delete")}
                disabled={!bulkAllowedActions.includes("hard_delete")}
                className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-negative-1/30 px-3 text-sm text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Detail modal */}
      <CommentDetailModal
        comment={openedComment}
        isOpen={openedComment !== null && !isSingleActionModalOpen}
        isActionPending={
          actionMutation.isPending &&
          actionItems.length === 1 &&
          actionItems[0]?.id === openedComment?.id
        }
        onClose={handleCloseModal}
        onCommentChange={setOpenedComment}
        onSelectAction={(comment, action) =>
          handleOpenActionModal(comment, action)
        }
      />

      <CommentDeleteModal
        isOpen={actionContext !== null}
        title={actionModalTitle}
        count={actionModalCount}
        cascadeCount={cascadeCount}
        allowedActions={[...actionModalActions]}
        defaultAction={actionContext?.defaultAction}
        isPending={actionMutation.isPending}
        onClose={handleCloseActionModal}
        onConfirm={async (action) => {
          if (actionItems.length === 0) {
            return;
          }

          await actionMutation.mutateAsync({
            action,
            items: actionItems,
          });
        }}
      />
    </>
  );
}
