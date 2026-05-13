"use client";

import { useEffect, useRef, useState } from "react";
import {
  DayPicker,
  useDayPicker,
  type DateRange,
  type MonthCaptionProps,
} from "react-day-picker";
import { Icon } from "@iconify/react/offline";
import calendarLinear from "@iconify-icons/solar/calendar-linear";
import closeCircleLinear from "@iconify-icons/solar/close-circle-linear";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import refreshLinear from "@iconify-icons/solar/restart-linear";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import type { PostListItem } from "@entities/post";
import { fetchAdminPosts } from "@entities/post";
import { cn } from "@shared/lib/style-utils";
import { DropSelect } from "@shared/ui/libs";

export type CommentStatusFilter = "all" | "active" | "deleted" | "hidden";
export type CommentAuthorTypeFilter = "all" | "oauth" | "guest";

interface CommentFiltersProps {
  status: CommentStatusFilter;
  authorType: CommentAuthorTypeFilter;
  postId: number | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
  dateError: string | undefined;
  onStatusChange: (v: CommentStatusFilter) => void;
  onAuthorTypeChange: (v: CommentAuthorTypeFilter) => void;
  onPostChange: (id: number | undefined, title: string | undefined) => void;
  onDateChange: (start: string | undefined, end: string | undefined) => void;
}

interface SelectOption<T extends string> {
  label: string;
  value: T;
  triggerLabel?: string;
}

const STATUS_OPTIONS: Array<SelectOption<CommentStatusFilter>> = [
  { label: "전체", value: "all", triggerLabel: "상태" },
  { label: "정상", value: "active" },
  { label: "삭제됨", value: "deleted" },
  { label: "숨김", value: "hidden" },
];

const AUTHOR_TYPE_OPTIONS: Array<SelectOption<CommentAuthorTypeFilter>> = [
  { label: "전체", value: "all", triggerLabel: "작성자" },
  { label: "OAuth", value: "oauth" },
  { label: "게스트", value: "guest" },
];

type DateRangePresetValue = "all" | "7d" | "30d" | "90d" | "custom";

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

function detectPreset(
  startDate: string | undefined,
  endDate: string | undefined,
): DateRangePresetValue {
  if (!startDate && !endDate) {
    return "all";
  }

  const today = toDateInputValue(new Date());

  if (endDate !== today) {
    return "custom";
  }

  if (startDate === buildRelativeStart(7)) return "7d";
  if (startDate === buildRelativeStart(30)) return "30d";
  if (startDate === buildRelativeStart(90)) return "90d";

  return "custom";
}

function parseDateValue(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return parseISO(value);
}

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from && !range?.to) {
    return "날짜 범위";
  }

  if (range.from && !range.to) {
    return `${format(range.from, "yyyy.MM.dd")} -`;
  }

  if (range.from && range.to) {
    return `${format(range.from, "yyyy.MM.dd")} - ${format(
      range.to,
      "yyyy.MM.dd",
    )}`;
  }

  return "날짜 범위";
}

function isSameDayRange(range: DateRange | undefined) {
  return Boolean(
    range?.from &&
    range?.to &&
    format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd"),
  );
}

function getSelectTriggerWidthCh<T extends string>(
  label: string,
  options: Array<SelectOption<T>>,
) {
  const longest = options.reduce((max, option) => {
    const triggerText =
      option.value === "all" ? (option.triggerLabel ?? label) : option.label;

    return Math.max(max, triggerText.length);
  }, label.length);

  return `${Math.max(longest + 4, 7)}em`;
}

function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
}: {
  startDate: string | undefined;
  endDate: string | undefined;
  onDateChange: (start: string | undefined, end: string | undefined) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const range: DateRange | undefined =
    startDate || endDate
      ? {
          from: parseDateValue(startDate),
          to: parseDateValue(endDate),
        }
      : undefined;
  const isSingleDaySelection = isSameDayRange(range);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  function CustomMonthCaption({ calendarMonth, className }: MonthCaptionProps) {
    const { previousMonth, nextMonth, goToMonth, components } = useDayPicker();

    return (
      <div
        className={cn(
          "relative flex h-8 items-center justify-center pl-8 pr-8 text-center",
          className,
        )}
      >
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              previousMonth ? goToMonth(previousMonth) : undefined
            }
            disabled={!previousMonth}
            className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-[0.45rem] text-text-3 transition-colors hover:bg-background-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="이전 달"
          >
            <components.Chevron orientation="left" size={13} />
          </button>

          <span className="text-sm font-semibold leading-none text-text-1">
            {format(calendarMonth.date, "yyyy년 M월", { locale: ko })}
          </span>

          <button
            type="button"
            onClick={() => (nextMonth ? goToMonth(nextMonth) : undefined)}
            disabled={!nextMonth}
            className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-[0.45rem] text-text-3 transition-colors hover:bg-background-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="다음 달"
          >
            <components.Chevron orientation="right" size={13} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onDateChange(undefined, undefined);
            setIsOpen(false);
          }}
          className="absolute right-0 top-1/2 inline-flex h-5 w-5 cursor-pointer -translate-y-1/2 items-center justify-center rounded-[0.45rem] border border-border-3 bg-background-1 text-text-3 transition-colors hover:border-border-2 hover:bg-background-2 hover:text-text-1"
          aria-label="기간 초기화"
        >
          <Icon icon={refreshLinear} width="12" />
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "relative flex h-10 min-w-[17rem] items-center gap-2 rounded-[0.8rem] border px-3 pr-10 text-left text-sm leading-none outline-none transition-colors",
          range?.from
            ? "border-primary-1/30 bg-primary-1/8 text-text-1"
            : "border-border-3 bg-background-1 text-text-2 hover:border-border-2",
        )}
      >
        <Icon
          icon={calendarLinear}
          width="16"
          className="shrink-0 text-text-4"
        />
        <span className="truncate">{formatRangeLabel(range)}</span>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-4">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-30 mt-2 rounded-[1.2rem] border border-border-3 bg-background-1 p-4 shadow-[0px_18px_48px_0px_rgba(0,0,0,0.16)]">
          <DayPicker
            locale={ko}
            mode="range"
            selected={range}
            defaultMonth={range?.from ?? new Date()}
            onSelect={(nextRange) => {
              if (!nextRange?.from && !nextRange?.to) {
                onDateChange(undefined, undefined);

                return;
              }

              onDateChange(
                nextRange?.from
                  ? format(nextRange.from, "yyyy-MM-dd")
                  : undefined,
                nextRange?.to ? format(nextRange.to, "yyyy-MM-dd") : undefined,
              );
            }}
            className="rdp-comment"
            components={{
              MonthCaption: CustomMonthCaption,
            }}
            classNames={{
              root: "rdp-root",
              months: "flex",
              month: "space-y-3",
              nav: "hidden",
              month_caption:
                "relative flex h-8 items-center justify-center pl-8 pr-8 text-center",
              caption_label: "text-sm font-semibold leading-none text-text-1",
              month_grid: "border-separate border-spacing-y-1.5",
              weekdays: "grid grid-cols-7",
              weekday:
                "h-8 w-10 text-center text-[11px] font-medium leading-none text-text-4",
              week: "grid grid-cols-7",
              day: "h-10 w-10 p-0 text-sm leading-none",
              day_button:
                "h-10 w-10 cursor-pointer rounded-xl text-sm leading-none text-text-2 transition-colors hover:bg-background-2 hover:text-text-1",
              selected:
                "[&>button]:bg-primary-1 [&>button]:text-white [&>button]:hover:bg-primary-1",
              range_start: cn(
                "[&>button]:bg-primary-1 [&>button]:text-white [&>button]:hover:bg-primary-1",
                isSingleDaySelection
                  ? "[&>button]:rounded-xl"
                  : "[&>button]:rounded-r-none",
              ),
              range_end: cn(
                "[&>button]:bg-primary-1 [&>button]:text-white [&>button]:hover:bg-primary-1",
                isSingleDaySelection
                  ? "[&>button]:rounded-xl"
                  : "[&>button]:rounded-l-none",
              ),
              range_middle:
                "[&>button]:cursor-pointer [&>button]:rounded-none [&>button]:bg-primary-1 [&>button]:text-white [&>button]:hover:bg-primary-1",
              today: "[&>button]:border [&>button]:border-primary-1/30",
              outside: "[&>button]:text-text-4 [&>button]:opacity-40",
              disabled: "[&>button]:text-text-4 [&>button]:opacity-30",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function CommentFilters({
  status,
  authorType,
  postId,
  startDate,
  endDate,
  dateError,
  onStatusChange,
  onAuthorTypeChange,
  onPostChange,
  onDateChange,
}: CommentFiltersProps) {
  const [postSearch, setPostSearch] = useState("");
  const [postOptions, setPostOptions] = useState<PostListItem[]>([]);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);
  const [selectedPostTitle, setSelectedPostTitle] = useState<
    string | undefined
  >(undefined);
  const [postLoading, setPostLoading] = useState(false);
  const postDropdownRef = useRef<HTMLDivElement>(null);
  const activePreset = detectPreset(startDate, endDate);
  const dateRangeOptions: Array<SelectOption<DateRangePresetValue>> = [
    { label: "전체", value: "all", triggerLabel: "기간" },
    { label: "7일", value: "7d" },
    { label: "30일", value: "30d" },
    { label: "90일", value: "90d" },
    { label: "사용자 지정", value: "custom" },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        postDropdownRef.current &&
        !postDropdownRef.current.contains(e.target as Node)
      ) {
        setPostDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (postId === undefined) {
      setSelectedPostTitle(undefined);
      setPostSearch("");
    }
  }, [postId]);

  useEffect(() => {
    if (!postDropdownOpen) return;

    const timer = setTimeout(() => {
      void (async () => {
        setPostLoading(true);
        try {
          const result = await fetchAdminPosts({
            q: postSearch || undefined,
            limit: 20,
          });
          setPostOptions(result.data);
        } catch {
          setPostOptions([]);
        } finally {
          setPostLoading(false);
        }
      })();
    }, 300);

    return () => clearTimeout(timer);
  }, [postSearch, postDropdownOpen]);

  function handlePostInputFocus() {
    setPostDropdownOpen(true);
  }

  function handleSelectPost(post: PostListItem) {
    setSelectedPostTitle(post.title);
    setPostSearch(post.title);
    setPostDropdownOpen(false);
    onPostChange(post.id, post.title);
  }

  function handleClearPost() {
    setSelectedPostTitle(undefined);
    setPostSearch("");
    setPostDropdownOpen(false);
    onPostChange(undefined, undefined);
  }

  function handlePresetChange(preset: DateRangePresetValue) {
    if (preset === "all") {
      onDateChange(undefined, undefined);

      return;
    }

    if (preset === "custom") {
      if (!startDate && !endDate) {
        onDateChange(
          toDateInputValue(new Date()),
          toDateInputValue(new Date()),
        );
      }

      return;
    }

    const days = Number.parseInt(preset.replace("d", ""), 10);
    onDateChange(buildRelativeStart(days), toDateInputValue(new Date()));
  }

  return (
    <>
      <div className="relative" ref={postDropdownRef}>
        <button
          type="button"
          onClick={handlePostInputFocus}
          className={cn(
            "inline-flex h-10 min-w-48 items-center gap-2 rounded-[0.8rem] border px-3 text-sm leading-none text-text-2 transition-colors",
            selectedPostTitle
              ? "border-primary-1/30 bg-primary-1/8 text-text-1"
              : "border-border-3 bg-background-1 hover:border-border-2",
          )}
        >
          <span className="max-w-[15rem] truncate">
            {selectedPostTitle ?? "전체 게시글"}
          </span>
        </button>

        {postDropdownOpen ? (
          <div className="absolute left-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-border-3 bg-background-1 shadow-[0px_16px_40px_0px_rgba(0,0,0,0.12)]">
            <div className="border-b border-border-3 p-3">
              <div className="relative">
                <Icon
                  icon={magniferLinear}
                  width="16"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4"
                />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => {
                    setPostSearch(e.target.value);
                    if (selectedPostTitle) {
                      setSelectedPostTitle(undefined);
                      onPostChange(undefined, undefined);
                    }
                  }}
                  placeholder="게시글 제목 검색"
                  className="w-full rounded-[0.8rem] border border-border-3 bg-background-2 py-2.5 pl-9 pr-10 text-sm leading-none text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
                />
                {postSearch ? (
                  <button
                    type="button"
                    onClick={handleClearPost}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 transition-colors hover:text-text-2"
                    aria-label="글 필터 초기화"
                  >
                    <Icon icon={closeCircleLinear} width="16" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
              <button
                type="button"
                onClick={handleClearPost}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm leading-none transition-colors hover:bg-background-2",
                  postId === undefined ? "text-primary-1" : "text-text-1",
                )}
              >
                전체 게시글
              </button>

              {postLoading ? (
                <div className="px-4 py-3 text-sm leading-none text-text-4">
                  검색 중...
                </div>
              ) : postOptions.length > 0 ? (
                <ul>
                  {postOptions.map((post) => (
                    <li key={post.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectPost(post)}
                        className="w-full px-4 py-3 text-left text-sm leading-none text-text-1 transition-colors hover:bg-background-2"
                      >
                        <span className="block truncate">{post.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm leading-none text-text-4">
                  검색 결과 없음
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <DropSelect
        ariaLabel="상태"
        value={status}
        options={STATUS_OPTIONS}
        onChange={onStatusChange}
        triggerClassName="w-[8em]"
        showSelectedIndicator
      />

      <DropSelect
        ariaLabel="작성자"
        value={authorType}
        options={AUTHOR_TYPE_OPTIONS}
        onChange={onAuthorTypeChange}
        triggerStyle={{
          width: getSelectTriggerWidthCh("작성자", AUTHOR_TYPE_OPTIONS),
        }}
        showSelectedIndicator
      />

      <DropSelect
        ariaLabel="기간"
        value={activePreset}
        options={dateRangeOptions}
        onChange={handlePresetChange}
        triggerStyle={{
          width: getSelectTriggerWidthCh("기간", dateRangeOptions),
        }}
        showSelectedIndicator
      />

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateChange={onDateChange}
      />

      {dateError ? (
        <p className="text-xs leading-none text-negative-1">{dateError}</p>
      ) : null}
    </>
  );
}
