"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import closeCircleLinear from "@iconify-icons/solar/close-circle-linear";
import lockKeyholeLinear from "@iconify-icons/solar/lock-keyhole-linear";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import type {
  AdminGuestbookAuthorType,
  AdminGuestbookFilterStatus,
  AdminGuestbookItem,
} from "@entities/guestbook";
import { cn } from "@shared/lib/style-utils";
import { EmptyState } from "@shared/ui/libs";

interface GuestbookTableProps {
  items: AdminGuestbookItem[];
  status: AdminGuestbookFilterStatus;
  authorType: AdminGuestbookAuthorType | "all";
  startDate: string;
  endDate: string;
  searchQuery: string;
  searchInput: string;
  selectedIds: number[];
  allCurrentSelected: boolean;
  someCurrentSelected: boolean;
  onStatusChange: (value: AdminGuestbookFilterStatus) => void;
  onAuthorTypeChange: (value: AdminGuestbookAuthorType | "all") => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onToggleSelect: (item: AdminGuestbookItem) => void;
  onToggleSelectAllCurrent: () => void;
  onOpenDetail: (item: AdminGuestbookItem) => void;
  emptyMessage?: string;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getStatusLabel(status: AdminGuestbookItem["status"]) {
  if (status === "hidden") {
    return "숨김";
  }

  if (status === "deleted") {
    return "삭제됨";
  }

  return "정상";
}

function getStatusTone(status: AdminGuestbookItem["status"]) {
  if (status === "hidden") {
    return "bg-amber-500/10 text-amber-700";
  }

  if (status === "deleted") {
    return "bg-negative-1/10 text-negative-1";
  }

  return "bg-primary-1/10 text-primary-1";
}

function getBodyPreview(item: AdminGuestbookItem) {
  return item.body || "삭제된 방명록입니다.";
}

export function GuestbookTable({
  items,
  status,
  authorType,
  startDate,
  endDate,
  searchQuery,
  searchInput,
  selectedIds,
  allCurrentSelected,
  someCurrentSelected,
  onStatusChange,
  onAuthorTypeChange,
  onStartDateChange,
  onEndDateChange,
  onSearchInputChange,
  onSearchSubmit,
  onClearSearch,
  onToggleSelect,
  onToggleSelectAllCurrent,
  onOpenDetail,
  emptyMessage,
}: GuestbookTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectAllRef.current) {
      return;
    }

    selectAllRef.current.indeterminate =
      someCurrentSelected && !allCurrentSelected;
  }, [allCurrentSelected, someCurrentSelected]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.3rem] border border-border-3 bg-background-1 p-4">
        <div className="grid gap-3 xl:grid-cols-[10rem_10rem_10rem_10rem_minmax(0,1fr)]">
          <label className="flex min-w-[8rem] flex-col gap-1.5 text-xs text-text-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
              상태
            </span>
            <select
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as AdminGuestbookFilterStatus)
              }
              className="rounded-[0.9rem] border border-border-3 bg-background-2 px-3 py-2.5 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
            >
              <option value="all">전체</option>
              <option value="active">정상</option>
              <option value="hidden">숨김</option>
              <option value="deleted">삭제됨</option>
            </select>
          </label>

          <label className="flex min-w-[8rem] flex-col gap-1.5 text-xs text-text-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
              작성자
            </span>
            <select
              value={authorType}
              onChange={(event) =>
                onAuthorTypeChange(
                  event.target.value as AdminGuestbookAuthorType | "all",
                )
              }
              className="rounded-[0.9rem] border border-border-3 bg-background-2 px-3 py-2.5 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
            >
              <option value="all">전체</option>
              <option value="oauth">OAuth</option>
              <option value="guest">게스트</option>
            </select>
          </label>

          <label className="flex min-w-[10rem] flex-col gap-1.5 text-xs text-text-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
              시작일
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              className="rounded-[0.9rem] border border-border-3 bg-background-2 px-3 py-2.5 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
            />
          </label>

          <label className="flex min-w-[10rem] flex-col gap-1.5 text-xs text-text-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
              종료일
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => onEndDateChange(event.target.value)}
              className="rounded-[0.9rem] border border-border-3 bg-background-2 px-3 py-2.5 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
            />
          </label>

          <div className="flex flex-col gap-1.5 text-xs text-text-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
              검색
            </span>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
              <div className="relative">
                <Icon
                  icon={magniferLinear}
                  width="16"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => onSearchInputChange(event.target.value)}
                  placeholder="작성자/내용 검색"
                  className="w-[16rem] rounded-[0.9rem] border border-border-3 bg-background-2 py-2.5 pl-9 pr-9 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 placeholder:text-text-4"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-4 transition-colors hover:text-text-2"
                    aria-label="검색어 초기화"
                  >
                    <Icon icon={closeCircleLinear} width="16" />
                  </button>
                ) : null}
              </div>
              <button
                type="submit"
                className="rounded-[0.9rem] border border-border-3 px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
              >
                검색
              </button>
            </form>
          </div>
        </div>
      </div>

      {searchQuery ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-3">
          <span className="rounded-full border border-border-3 bg-background-1 px-3 py-1.5 text-text-2">
            &apos;{searchQuery}&apos; 검색 결과
          </span>
          <button
            type="button"
            onClick={onClearSearch}
            className="text-text-4 transition-colors hover:text-text-2"
          >
            해제
          </button>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-border-3">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-background-2">
              <thead className="bg-background-1 text-left text-[11px] uppercase tracking-[0.18em] text-text-4">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={onToggleSelectAllCurrent}
                      className="h-4 w-4 rounded border-border-3 accent-primary-1"
                      aria-label="현재 페이지 전체 선택"
                    />
                  </th>
                  <th className="px-6 py-4 font-medium">작성자</th>
                  <th className="px-6 py-4 font-medium">내용</th>
                  <th className="px-6 py-4 font-medium">비밀</th>
                  <th className="px-6 py-4 font-medium">상태</th>
                  <th className="px-6 py-4 font-medium">날짜</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-3">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "align-top transition-colors hover:bg-background-1/70",
                        isSelected && "bg-primary-1/6",
                      )}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(item)}
                          className="h-4 w-4 rounded border-border-3 accent-primary-1"
                          aria-label={`${item.author.name} 방명록 선택`}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className="font-semibold text-text-1">
                            {item.author.name}
                          </span>
                          <span className="inline-flex w-fit rounded-full border border-border-3 bg-background-1 px-2 py-0.5 text-[11px] font-medium text-text-3">
                            {item.author.type === "oauth" ? "OAuth" : "게스트"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(item)}
                          className="max-w-[26rem] text-left text-sm leading-6 text-text-2 transition-colors hover:text-primary-1"
                          title={getBodyPreview(item)}
                        >
                          <span className="line-clamp-2">
                            {getBodyPreview(item)}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        {item.isSecret ? (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-1/10 text-primary-1">
                            <Icon icon={lockKeyholeLinear} width="15" />
                          </span>
                        ) : (
                          <span className="text-sm text-text-4">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            getStatusTone(item.status),
                          )}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-text-2">
                        {dateFormatter.format(new Date(item.createdAt))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState message={emptyMessage ?? "표시할 방명록이 없습니다."} />
      )}
    </div>
  );
}
