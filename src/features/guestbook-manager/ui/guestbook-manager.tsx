"use client";

import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GuestbookActionModal,
  type GuestbookManageAction,
} from "./guestbook-action-modal";
import { GuestbookDetailModal } from "./guestbook-detail-modal";
import { GuestbookTable, type GuestbookPeriodFilter } from "./guestbook-table";
import {
  adminBulkDeleteGuestbookEntries,
  adminBulkPatchGuestbookEntries,
  adminDeleteGuestbookEntry,
  adminPatchGuestbookEntry,
  fetchAdminGuestbook,
  fetchGuestbookSettings,
  type AdminGuestbookAuthorType,
  type AdminGuestbookFilterStatus,
  type AdminGuestbookItem,
  type AdminGuestbookPatchAction,
  updateGuestbookSettings,
} from "@entities/guestbook";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { Skeleton, Spinner } from "@shared/ui/libs";
import { ToggleSwitch } from "@shared/ui/toggle-switch";

const PAGE_SIZE = 10;
const QUERY_KEY = ["admin-guestbook"] as const;
const SETTINGS_QUERY_KEY = ["guestbook-settings"] as const;

type ActionContext =
  | {
      type: "single";
      item: AdminGuestbookItem;
      defaultAction?: GuestbookManageAction;
    }
  | {
      type: "bulk";
      items: AdminGuestbookItem[];
      defaultAction?: GuestbookManageAction;
    }
  | null;

function getAllowedActionsForStatus(status: AdminGuestbookItem["status"]) {
  if (status === "hidden") {
    return ["restore", "soft_delete", "hard_delete"] as const;
  }

  if (status === "deleted") {
    return ["restore", "hard_delete"] as const;
  }

  return ["hide", "soft_delete", "hard_delete"] as const;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildRelativeStart(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (days - 1));

  return toDateInputValue(date);
}

function detectPeriodFilter(
  startDate: string,
  endDate: string,
): GuestbookPeriodFilter {
  if (!startDate && !endDate) {
    return "all";
  }

  const today = toDateInputValue(new Date());
  if (endDate !== today) {
    return "all";
  }

  if (startDate === buildRelativeStart(7)) return "7d";
  if (startDate === buildRelativeStart(30)) return "30d";
  if (startDate === buildRelativeStart(90)) return "90d";

  return "all";
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
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
  if (windowEnd < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

function isPatchAction(
  action: GuestbookManageAction,
): action is AdminGuestbookPatchAction {
  return action === "hide" || action === "restore";
}

function getBulkOptions(items: AdminGuestbookItem[]) {
  const optionMap: Record<
    GuestbookManageAction,
    {
      value: GuestbookManageAction;
      label: string;
      description: string;
      tone?: "default" | "danger";
    }
  > = {
    hide: {
      value: "hide",
      label: "비공개 전환",
      description: "선택한 방명록을 공개 페이지에서 비공개 상태로 전환합니다.",
    },
    restore: {
      value: "restore",
      label: "복원",
      description: "선택한 숨김 방명록을 다시 공개 상태로 되돌립니다.",
    },
    soft_delete: {
      value: "soft_delete",
      label: "소프트 삭제",
      description: "본문은 보존한 채 공개 페이지에는 삭제된 상태로 표시합니다.",
    },
    hard_delete: {
      value: "hard_delete",
      label: "영구 삭제",
      description: "선택한 방명록을 완전히 삭제합니다. 되돌릴 수 없습니다.",
      tone: "danger",
    },
  };

  const commonActions = items.reduce<GuestbookManageAction[]>(
    (current, item, index) => {
      const allowedActions = [...getAllowedActionsForStatus(item.status)];

      if (index === 0) {
        return allowedActions;
      }

      return current.filter((action) => allowedActions.includes(action));
    },
    [],
  );

  return commonActions.map((action) => optionMap[action]);
}

function getBulkAllowedActions(items: AdminGuestbookItem[]) {
  return items.reduce<readonly GuestbookManageAction[]>((current, item) => {
    const allowedActions = [
      ...getAllowedActionsForStatus(item.status),
    ] as readonly GuestbookManageAction[];

    if (current.length === 0) {
      return [...allowedActions];
    }

    return current.filter((action) => allowedActions.includes(action));
  }, []);
}

export function GuestbookManager() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminGuestbookFilterStatus>("all");
  const [authorType, setAuthorType] = useState<
    AdminGuestbookAuthorType | "all"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    Record<number, AdminGuestbookItem>
  >({});
  const [detailItem, setDetailItem] = useState<AdminGuestbookItem | null>(null);
  const [actionContext, setActionContext] = useState<ActionContext>(null);
  const period = detectPeriodFilter(startDate, endDate);

  const guestbookQuery = useQuery({
    queryKey: [
      ...QUERY_KEY,
      page,
      status,
      authorType,
      startDate,
      endDate,
      searchQuery,
    ],
    queryFn: () =>
      fetchAdminGuestbook({
        page,
        limit: PAGE_SIZE,
        status,
        authorType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        q: searchQuery || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const settingsQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => fetchGuestbookSettings(),
  });

  const settingMutation = useMutation({
    mutationFn: updateGuestbookSettings,
    onSuccess: async (response) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, response);
      toast.success(
        response.enabled
          ? "방명록 기능을 활성화했습니다."
          : "방명록 기능을 비활성화했습니다.",
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "방명록 설정 변경에 실패했습니다."));
    },
  });

  const settingsStatusLabel = settingsQuery.isLoading
    ? "불러오는 중"
    : settingsQuery.isError
      ? "불러오기 실패"
      : settingsQuery.data?.enabled
        ? "활성"
        : "비활성";
  const isSettingsToggleDisabled =
    settingsQuery.isLoading ||
    settingsQuery.isError ||
    settingMutation.isPending;

  const actionMutation = useMutation({
    mutationFn: async (payload: {
      action: GuestbookManageAction;
      itemIds: number[];
      singleId?: number;
    }) => {
      if (payload.singleId !== undefined) {
        if (isPatchAction(payload.action)) {
          await adminPatchGuestbookEntry(payload.singleId, payload.action);
        } else {
          await adminDeleteGuestbookEntry(payload.singleId, payload.action);
        }

        return;
      }

      if (isPatchAction(payload.action)) {
        await adminBulkPatchGuestbookEntries(payload.itemIds, payload.action);
      } else {
        await adminBulkDeleteGuestbookEntries(payload.itemIds, payload.action);
      }
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["guestbook"] }),
      ]);
      setSelectedItems((current) => {
        const next = { ...current };
        for (const itemId of variables.itemIds) {
          delete next[itemId];
        }

        return next;
      });
      setDetailItem(null);
      setActionContext(null);
      toast.success("방명록 상태를 업데이트했습니다.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "방명록 처리에 실패했습니다."));
    },
  });

  const rows = guestbookQuery.data?.data ?? [];
  const meta = guestbookQuery.data?.meta;
  const selectedList = Object.values(selectedItems);
  const selectedIds = selectedList.map((item) => item.id);
  const currentPageIds = rows.map((item) => item.id);
  const allCurrentSelected =
    rows.length > 0 &&
    rows.every((item) => selectedItems[item.id] !== undefined);
  const someCurrentSelected =
    rows.some((item) => selectedItems[item.id] !== undefined) &&
    !allCurrentSelected;
  const offPageCount = selectedList.filter(
    (item) => !currentPageIds.includes(item.id),
  ).length;
  const pageNumbers = meta ? generatePageNumbers(page, meta.totalPages, 2) : [];
  const bulkAllowedActions = getBulkAllowedActions(selectedList);

  useEffect(() => {
    setSelectedItems((current) => {
      if (rows.length === 0) {
        return current;
      }

      const next = { ...current };
      for (const row of rows) {
        if (next[row.id]) {
          next[row.id] = row;
        }
      }

      return next;
    });
  }, [rows]);

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  function resetToFirstPage() {
    setPage(1);
  }

  function handleToggleSelect(item: AdminGuestbookItem) {
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

  function handleToggleSelectAllCurrent() {
    setSelectedItems((current) => {
      const next = { ...current };
      if (allCurrentSelected) {
        for (const row of rows) {
          delete next[row.id];
        }
      } else {
        for (const row of rows) {
          next[row.id] = row;
        }
      }

      return next;
    });
  }

  function handleClearSelection() {
    setSelectedItems({});
  }

  function handleSearchSubmit() {
    setSearchQuery(searchInput.trim());
    resetToFirstPage();
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearchQuery("");
    resetToFirstPage();
  }

  async function handleConfirmAction(action: GuestbookManageAction) {
    if (!actionContext) {
      return;
    }

    const itemIds =
      actionContext.type === "single"
        ? [actionContext.item.id]
        : actionContext.items.map((item) => item.id);

    await actionMutation.mutateAsync({
      action,
      itemIds,
      singleId:
        actionContext.type === "single" ? actionContext.item.id : undefined,
    });
  }

  const actionOptions =
    actionContext?.type === "single"
      ? getBulkOptions([actionContext.item])
      : actionContext?.type === "bulk"
        ? getBulkOptions(actionContext.items)
        : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium leading-none text-text-2">
          전체 {meta?.total.toLocaleString("ko-KR") ?? 0}개
        </p>
        <div className="flex items-center gap-3">
          {settingsQuery.isLoading ? <Spinner size="sm" /> : null}
          <span className="text-sm font-medium leading-none text-text-2">
            방명록 기능 {settingsStatusLabel}
          </span>
          {settingsQuery.isError ? (
            <button
              type="button"
              onClick={() => void settingsQuery.refetch()}
              className="rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
            >
              다시 시도
            </button>
          ) : null}
          <ToggleSwitch
            checked={settingsQuery.data?.enabled ?? false}
            disabled={isSettingsToggleDisabled}
            onChange={(nextChecked) => {
              void settingMutation.mutateAsync(nextChecked);
            }}
            aria-label="방명록 기능 활성화 토글"
          />
        </div>
      </div>

      {settingsQuery.isError ? (
        <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-sm text-negative-1">
          {getErrorMessage(
            settingsQuery.error,
            "방명록 설정을 불러오지 못했습니다. 상태를 확인한 뒤 다시 시도해 주세요.",
          )}
        </div>
      ) : null}

      <section
        className={
          selectedIds.length > 0
            ? "bg-background-1 pb-24 md:pb-28"
            : "bg-background-1 p-0"
        }
      >
        {guestbookQuery.isLoading && !guestbookQuery.data ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rect"
                  height="2.5rem"
                  className="w-[8rem] rounded-[0.8rem]"
                />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rect"
                  height="3.25rem"
                  className="rounded-[0.9rem]"
                />
              ))}
            </div>
          </div>
        ) : null}

        {!guestbookQuery.isLoading && guestbookQuery.isError ? (
          <div className="rounded-[1.5rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8 text-center">
            <p className="text-sm text-negative-1">
              {getErrorMessage(
                guestbookQuery.error,
                "방명록 목록을 불러오지 못했습니다.",
              )}
            </p>
            <button
              type="button"
              onClick={() => void guestbookQuery.refetch()}
              className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {!guestbookQuery.isLoading && !guestbookQuery.isError ? (
          <>
            <GuestbookTable
              items={rows}
              status={status}
              authorType={authorType}
              period={period}
              searchInput={searchInput}
              selectedIds={selectedIds}
              allCurrentSelected={allCurrentSelected}
              someCurrentSelected={someCurrentSelected}
              onStatusChange={(nextStatus) => {
                setStatus(nextStatus);
                resetToFirstPage();
              }}
              onAuthorTypeChange={(nextAuthorType) => {
                setAuthorType(nextAuthorType);
                resetToFirstPage();
              }}
              onPeriodChange={(value) => {
                if (value === "all") {
                  setStartDate("");
                  setEndDate("");
                } else {
                  const days = Number.parseInt(value.replace("d", ""), 10);
                  setStartDate(buildRelativeStart(days));
                  setEndDate(toDateInputValue(new Date()));
                }
                resetToFirstPage();
              }}
              onSearchInputChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
              onClearSearch={handleClearSearch}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAllCurrent={handleToggleSelectAllCurrent}
              onOpenDetail={(item) => setDetailItem(item)}
              emptyMessage={
                searchQuery ||
                status !== "all" ||
                authorType !== "all" ||
                startDate ||
                endDate
                  ? "검색 결과가 없습니다."
                  : "현재 등록된 방명록이 없습니다."
              }
            />

            {meta && meta.totalPages > 1 ? (
              <div className="mt-5 border-t border-border-4 pt-4">
                <nav
                  aria-label="관리자 방명록 페이지네이션"
                  className="flex items-center justify-center gap-0.5"
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
                        className={
                          pageNumber === page
                            ? "pointer-events-none inline-flex min-w-[2rem] items-center justify-center rounded bg-primary-1 px-2.5 py-1.5 text-sm font-semibold text-white"
                            : "inline-flex min-w-[2rem] items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2"
                        }
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
            ) : null}
          </>
        ) : null}
      </section>

      {selectedIds.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 md:left-60">
          <div className="flex flex-wrap items-center gap-3 border-t border-border-3 bg-[rgba(241,242,243,0.95)] px-4 py-3 backdrop-blur-[12px] md:px-6 dark:bg-[rgba(19,20,21,0.94)]">
            <span className="text-sm font-medium text-text-1">
              선택됨 {selectedIds.length}개
              {offPageCount > 0 ? (
                <span className="ml-1 text-xs text-text-3">
                  (다른 페이지 {offPageCount}개 포함)
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
                전체 선택
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
                onClick={() =>
                  setActionContext({
                    type: "bulk",
                    items: selectedList,
                    defaultAction: "hide",
                  })
                }
                disabled={!bulkAllowedActions.includes("hide")}
                className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                숨김
              </button>
              <button
                type="button"
                onClick={() =>
                  setActionContext({
                    type: "bulk",
                    items: selectedList,
                    defaultAction: "soft_delete",
                  })
                }
                disabled={!bulkAllowedActions.includes("soft_delete")}
                className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                소프트 삭제
              </button>
              <button
                type="button"
                onClick={() =>
                  setActionContext({
                    type: "bulk",
                    items: selectedList,
                    defaultAction: "hard_delete",
                  })
                }
                disabled={!bulkAllowedActions.includes("hard_delete")}
                className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-negative-1/30 px-3 text-sm text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <GuestbookDetailModal
        item={detailItem}
        isOpen={detailItem !== null}
        onClose={() => setDetailItem(null)}
        onSelectAction={(action) => {
          if (detailItem) {
            setDetailItem(null);
            setActionContext({
              type: "single",
              item: detailItem,
              defaultAction: action,
            });
          }
        }}
        isPending={actionMutation.isPending}
      />

      <GuestbookActionModal
        isOpen={actionContext !== null}
        onClose={() => setActionContext(null)}
        onConfirm={handleConfirmAction}
        options={actionOptions}
        defaultAction={actionContext?.defaultAction}
        title={
          actionContext?.type === "bulk"
            ? "선택한 방명록 처리"
            : "방명록 처리 방식 선택"
        }
        description={
          actionContext?.type === "bulk"
            ? `선택한 ${actionContext.items.length}개 항목에 적용할 작업을 선택하세요.`
            : "현재 방명록 상태에 따라 적용 가능한 작업만 표시됩니다."
        }
        confirmLabel="확인"
        isPending={actionMutation.isPending}
      />
    </div>
  );
}
