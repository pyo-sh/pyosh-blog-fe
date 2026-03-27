"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import type { Post } from "@entities/post";

export type AdminPostTab = "active" | "trash";
export type AdminPostStatusFilter = Post["status"] | "all";
export type AdminPostVisibilityFilter = Post["visibility"] | "all";

interface PostFiltersProps {
  tab: AdminPostTab;
  trashCount?: number;
  status: AdminPostStatusFilter;
  visibility: AdminPostVisibilityFilter;
  searchQuery: string;
  onTabChange: (tab: AdminPostTab) => void;
  onStatusChange: (status: AdminPostStatusFilter) => void;
  onVisibilityChange: (visibility: AdminPostVisibilityFilter) => void;
  onSearch: (q: string) => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: AdminPostStatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "초안", value: "draft" },
  { label: "발행", value: "published" },
  { label: "보관", value: "archived" },
];

const VISIBILITY_OPTIONS: Array<{
  label: string;
  value: AdminPostVisibilityFilter;
}> = [
  { label: "전체", value: "all" },
  { label: "공개", value: "public" },
  { label: "비공개", value: "private" },
];

export function PostFilters({
  tab,
  trashCount,
  status,
  visibility,
  searchQuery,
  onTabChange,
  onStatusChange,
  onVisibilityChange,
  onSearch,
}: PostFiltersProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    onSearch(inputValue.trim());
  }

  function handleClearSearch() {
    setInputValue("");
    onSearch("");
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-[1rem] border border-border-3 bg-background-1 p-1 w-fit">
        <button
          type="button"
          onClick={() => onTabChange("active")}
          className={
            tab === "active"
              ? "rounded-[0.75rem] bg-background-2 px-4 py-2 text-sm font-semibold text-text-1 shadow-sm"
              : "rounded-[0.75rem] px-4 py-2 text-sm font-medium text-text-3 hover:text-text-1"
          }
        >
          활성 글
        </button>
        <button
          type="button"
          onClick={() => onTabChange("trash")}
          className={
            tab === "trash"
              ? "rounded-[0.75rem] bg-background-2 px-4 py-2 text-sm font-semibold text-text-1 shadow-sm"
              : "rounded-[0.75rem] px-4 py-2 text-sm font-medium text-text-3 hover:text-text-1"
          }
        >
          휴지통
          {trashCount !== undefined && trashCount > 0 ? (
            <span className="ml-1.5 rounded-full bg-negative-1/10 px-1.5 py-0.5 text-xs font-medium text-negative-1">
              {trashCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Filters - only for active tab */}
      {tab === "active" ? (
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1.5 text-xs text-text-3">
            <span className="font-medium text-text-2">상태</span>
            <select
              value={status}
              onChange={(e) => {
                onStatusChange(e.target.value as AdminPostStatusFilter);
              }}
              className="min-w-32 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-text-3">
            <span className="font-medium text-text-2">공개</span>
            <select
              value={visibility}
              onChange={(e) => {
                onVisibilityChange(e.target.value as AdminPostVisibilityFilter);
              }}
              className="min-w-32 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-1.5 text-xs text-text-3">
            <span className="font-medium text-text-2">검색</span>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="검색어 입력"
                  className="w-52 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2 pr-8 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 placeholder:text-text-4"
                />
                {inputValue ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-2"
                    aria-label="검색 초기화"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
              <button
                type="submit"
                className="rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
              >
                검색
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Active search badge */}
      {tab === "active" && searchQuery ? (
        <p className="text-sm text-text-3">
          <span className="font-medium text-text-1">
            &apos;{searchQuery}&apos;
          </span>{" "}
          검색 결과
        </p>
      ) : null}
    </div>
  );
}
