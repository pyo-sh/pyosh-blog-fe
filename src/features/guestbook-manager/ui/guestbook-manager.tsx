"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GuestbookActionModal,
  type GuestbookManageAction,
} from "./guestbook-action-modal";
import { GuestbookDetailModal } from "./guestbook-detail-modal";
import { GuestbookTable } from "./guestbook-table";
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

function getPageLabel(
  total: number,
  page: number,
  limit: number,
  count: number,
) {
  if (count === 0) {
    return "표시할 방명록이 없습니다.";
  }

  const start = (page - 1) * limit + 1;
  const end = start + count - 1;

  return `총 ${total.toLocaleString("ko-KR")}개 중 ${start}-${end}`;
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
      label: "숨기기",
      description: "선택한 방명록을 공개 페이지에서 숨깁니다.",
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
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Guestbook
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-text-1">
            방명록 관리
          </h1>
          <p className="mt-2 text-sm text-text-3">
            방명록 상태를 필터링하고, 상세 내용을 확인한 뒤 숨김 또는 삭제를
            처리합니다.
          </p>
        </div>

        <div className="rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-text-4">
            페이지 크기
          </p>
          <p className="mt-2 text-sm font-medium text-text-2">
            페이지당 {PAGE_SIZE}개
          </p>
        </div>
      </header>

      <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
        <div className="flex flex-col gap-5 rounded-[1.25rem] border border-border-3 bg-background-1 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-1">방명록 기능</p>
            <p className="mt-1 text-sm text-text-3">
              공개 페이지 방명록 영역과 작성 API를 함께 제어합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {settingsQuery.isLoading ? <Spinner size="sm" /> : null}
            <span className="text-sm font-medium text-text-2">
              {settingsStatusLabel}
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
          <div className="mt-4 rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-sm text-negative-1">
            {getErrorMessage(
              settingsQuery.error,
              "방명록 설정을 불러오지 못했습니다. 상태를 확인한 뒤 다시 시도해 주세요.",
            )}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 border-b border-border-3 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-1">방명록 목록</h2>
            <p className="mt-1 text-sm text-text-3">
              검색과 필터를 조합해 필요한 항목만 빠르게 확인할 수 있습니다.
            </p>
          </div>

          <p className="text-sm text-text-4">
            {guestbookQuery.isFetching && !guestbookQuery.isLoading
              ? "목록을 새로 불러오는 중..."
              : meta
                ? getPageLabel(meta.total, meta.page, meta.limit, rows.length)
                : "목록을 준비 중입니다."}
          </p>
        </div>

        {selectedIds.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[1rem] border border-primary-1/20 bg-primary-1/5 px-4 py-3">
            <label className="flex items-center gap-2 text-sm font-medium text-text-1">
              <input
                type="checkbox"
                checked={allCurrentSelected}
                onChange={handleToggleSelectAllCurrent}
                className="h-4 w-4 rounded border-border-3 accent-primary-1"
              />
              전체
            </label>
            <span className="text-sm text-text-2">
              선택됨 {selectedIds.length}개
              {offPageCount > 0 ? ` (다른 페이지 ${offPageCount}개 포함)` : ""}
            </span>
            <button
              type="button"
              onClick={() =>
                setActionContext({
                  type: "bulk",
                  items: selectedList,
                })
              }
              className="rounded-[0.75rem] bg-primary-1 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              일괄 작업
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-sm text-text-4 transition-colors hover:text-text-2"
            >
              전체 해제
            </button>
          </div>
        ) : null}

        <div className="mt-6">
          {guestbookQuery.isLoading ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rect"
                    height="4.5rem"
                    className="rounded-[1rem]"
                  />
                ))}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rect"
                    height="3.75rem"
                    className="rounded-[1rem]"
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
                startDate={startDate}
                endDate={endDate}
                searchQuery={searchQuery}
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
                onStartDateChange={(value) => {
                  setStartDate(value);
                  resetToFirstPage();
                }}
                onEndDateChange={(value) => {
                  setEndDate(value);
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
                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="text-sm text-text-4">
                    페이지 {meta.page} / {meta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={page <= 1}
                      className="rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) =>
                          meta
                            ? Math.min(meta.totalPages, current + 1)
                            : current,
                        )
                      }
                      disabled={!meta || page >= meta.totalPages}
                      className="rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

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
