"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { Icon } from "@iconify/react/offline";
import chatRoundDotsLinear from "@iconify-icons/solar/chat-round-dots-linear";
import closeCircleLinear from "@iconify-icons/solar/close-circle-linear";
import lockKeyholeLinear from "@iconify-icons/solar/lock-keyhole-linear";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import type {
  AdminGuestbookAuthorType,
  AdminGuestbookFilterStatus,
  AdminGuestbookItem,
} from "@entities/guestbook";
import { cn } from "@shared/lib/style-utils";
import { DropSelect, EmptyState } from "@shared/ui/libs";

interface GuestbookTableProps {
  items: AdminGuestbookItem[];
  status: AdminGuestbookFilterStatus;
  authorType: AdminGuestbookAuthorType | "all";
  period: GuestbookPeriodFilter;
  startDate: string;
  endDate: string;
  dateError?: string;
  searchInput: string;
  selectedIds: number[];
  allCurrentSelected: boolean;
  someCurrentSelected: boolean;
  onStatusChange: (value: AdminGuestbookFilterStatus) => void;
  onAuthorTypeChange: (value: AdminGuestbookAuthorType | "all") => void;
  onPeriodChange: (value: GuestbookPeriodFilter) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onToggleSelect: (item: AdminGuestbookItem) => void;
  onToggleSelectAllCurrent: () => void;
  onOpenDetail: (item: AdminGuestbookItem) => void;
  onOpenAction: (item: AdminGuestbookItem) => void;
  emptyMessage?: string;
}

interface SelectOption<T extends string> {
  label: string;
  value: T;
  triggerLabel?: string;
}

export type GuestbookPeriodFilter = "all" | "7d" | "30d" | "90d";

const STATUS_OPTIONS: Array<SelectOption<AdminGuestbookFilterStatus>> = [
  { label: "전체", value: "all", triggerLabel: "상태" },
  { label: "정상", value: "active" },
  { label: "숨김", value: "hidden" },
  { label: "삭제됨", value: "deleted" },
];

const AUTHOR_OPTIONS: Array<SelectOption<AdminGuestbookAuthorType | "all">> = [
  { label: "전체", value: "all", triggerLabel: "작성자 타입" },
  { label: "OAuth", value: "oauth" },
  { label: "게스트", value: "guest" },
];

const PERIOD_OPTIONS: Array<SelectOption<GuestbookPeriodFilter>> = [
  { label: "전체 기간", value: "all", triggerLabel: "전체 기간" },
  { label: "최근 7일", value: "7d" },
  { label: "최근 30일", value: "30d" },
  { label: "최근 90일", value: "90d" },
];

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getStatusLabel(status: AdminGuestbookItem["status"]) {
  if (status === "hidden") return "숨김";
  if (status === "deleted") return "삭제됨";

  return "정상";
}

function getStatusTone(status: AdminGuestbookItem["status"]) {
  if (status === "hidden") return "bg-background-3 text-text-3";
  if (status === "deleted") return "bg-negative-1/10 text-negative-1";

  return "bg-positive-1/10 text-positive-1";
}

function getBodyPreview(item: AdminGuestbookItem) {
  return item.body || "삭제된 방명록입니다.";
}

export function GuestbookTable({
  items,
  status,
  authorType,
  period,
  startDate,
  endDate,
  dateError,
  searchInput,
  selectedIds,
  allCurrentSelected,
  someCurrentSelected,
  onStatusChange,
  onAuthorTypeChange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onSearchInputChange,
  onSearchSubmit,
  onClearSearch,
  onToggleSelect,
  onToggleSelectAllCurrent,
  onOpenDetail,
  onOpenAction,
  emptyMessage,
}: GuestbookTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate =
      someCurrentSelected && !allCurrentSelected;
  }, [allCurrentSelected, someCurrentSelected]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-start gap-3">
        <DropSelect
          ariaLabel="상태"
          value={status}
          options={STATUS_OPTIONS}
          onChange={onStatusChange}
          triggerClassName="w-[8em]"
          showSelectedIndicator
        />

        <DropSelect
          ariaLabel="작성자 타입"
          value={authorType}
          options={AUTHOR_OPTIONS}
          onChange={onAuthorTypeChange}
          triggerClassName="w-[9em]"
          showSelectedIndicator
        />

        <DropSelect
          ariaLabel="전체 기간"
          value={period}
          options={PERIOD_OPTIONS}
          onChange={onPeriodChange}
          triggerClassName="w-[9em]"
          showSelectedIndicator
        />

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="h-10 rounded-[0.8rem] border border-border-3 bg-background-1 px-3 text-sm leading-none text-text-1 outline-none transition-colors focus:border-primary-1"
            aria-label="시작일"
          />
          <span className="text-sm leading-none text-text-4">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            min={startDate || undefined}
            className="h-10 rounded-[0.8rem] border border-border-3 bg-background-1 px-3 text-sm leading-none text-text-1 outline-none transition-colors focus:border-primary-1"
            aria-label="종료일"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex min-w-72 flex-1">
          <div className="relative w-full">
            <Icon
              icon={magniferLinear}
              width="16"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearchSubmit();
                }
              }}
              placeholder="작성자 또는 내용 검색..."
              className="h-10 w-full rounded-[0.8rem] border border-border-3 bg-background-1 py-2.5 pl-9 pr-10 text-sm leading-none text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center text-text-4 transition-colors hover:text-text-2"
                aria-label="검색어 초기화"
              >
                <Icon icon={closeCircleLinear} width="16" />
              </button>
            ) : null}
          </div>
        </form>
      </div>

      {dateError ? (
        <p className="text-sm leading-none text-negative-1">{dateError}</p>
      ) : null}

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border-4 bg-background-1">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-text-4">
                <tr>
                  <th className="w-10 whitespace-nowrap px-3 py-3.5 align-middle font-medium leading-none">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={onToggleSelectAllCurrent}
                      className="h-4 w-4 rounded border-border-3 accent-primary-1"
                      aria-label="현재 페이지 전체 선택"
                    />
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 align-middle font-medium leading-none">
                    작성자
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 align-middle font-medium leading-none">
                    내용
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 align-middle text-center font-medium leading-none">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-3 bg-background-1">
                      <Icon icon={lockKeyholeLinear} width="12" />
                    </span>
                    <span className="sr-only">비밀 여부</span>
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 align-middle font-medium leading-none">
                    상태
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 align-middle font-medium leading-none">
                    작성일
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 align-middle text-center font-medium leading-none">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-4">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onOpenDetail(item)}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-background-2",
                        isSelected && "bg-primary-1/6",
                      )}
                    >
                      <td className="whitespace-nowrap px-3 py-3.5 align-middle leading-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => onToggleSelect(item)}
                          className="h-4 w-4 rounded border-border-3 accent-primary-1"
                          aria-label={`${item.author.name} 방명록 선택`}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 align-middle leading-none">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-3 text-xs font-semibold text-text-2">
                            {item.author.name.trim().charAt(0) || "?"}
                          </span>
                          <span className="truncate text-sm font-medium leading-none text-text-1">
                            {item.author.name}
                          </span>
                          <span className="inline-flex w-fit items-center rounded-md bg-primary-1/10 px-1.5 py-0.5 text-[11px] font-medium leading-none text-primary-1">
                            {item.author.type === "oauth" ? "OAuth" : "게스트"}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 align-middle leading-none">
                        <span
                          className="block max-w-md truncate text-sm leading-none text-text-2"
                          title={getBodyPreview(item)}
                        >
                          {getBodyPreview(item)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 align-middle text-center leading-none">
                        {item.isSecret ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-1/10 text-primary-1">
                            <Icon icon={lockKeyholeLinear} width="15" />
                          </span>
                        ) : (
                          <span className="text-sm text-text-4">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 align-middle leading-none">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium leading-none",
                            getStatusTone(item.status),
                          )}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 align-middle text-xs leading-none text-text-4">
                        {dateFormatter.format(new Date(item.createdAt))}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 align-middle text-center leading-none">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenAction(item);
                            }}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3 hover:text-text-1"
                            aria-label="방명록 처리"
                          >
                            <Icon icon={chatRoundDotsLinear} width="15" />
                          </button>
                        </div>
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
