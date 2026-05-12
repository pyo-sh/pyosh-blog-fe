"use client";

import type { ReactNode } from "react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import type { Category } from "@entities/category";
import type { PostListItem } from "@entities/post";
import { cn } from "@shared/lib/style-utils";
import { DropSelect } from "@shared/ui/libs";

export type AdminPostTab = "active" | "trash";
export type AdminPostStatusFilter = PostListItem["status"] | "all";
export type AdminPostVisibilityFilter = PostListItem["visibility"] | "all";

interface PostFiltersProps {
  tab: AdminPostTab;
  trashCount?: number;
  status: AdminPostStatusFilter;
  visibility: AdminPostVisibilityFilter;
  categoryId?: number;
  categories: Category[];
  searchQuery: string;
  onTabChange: (tab: AdminPostTab) => void;
  onStatusChange: (status: AdminPostStatusFilter) => void;
  onVisibilityChange: (visibility: AdminPostVisibilityFilter) => void;
  onCategoryChange: (categoryId?: number) => void;
  onSearch: (q: string) => void;
  action?: ReactNode;
}

const STATUS_OPTIONS: Array<{ label: string; value: AdminPostStatusFilter }> = [
  { label: "전체 상태", value: "all" },
  { label: "작성", value: "draft" },
  { label: "발행", value: "published" },
  { label: "보관", value: "archived" },
];

const VISIBILITY_OPTIONS: Array<{
  label: string;
  value: AdminPostVisibilityFilter;
}> = [
  { label: "전체 공개범위", value: "all" },
  { label: "공개", value: "public" },
  { label: "비공개", value: "private" },
];

function flattenCategories(
  categories: Category[],
  parentId: number | null = null,
  depth = 0,
): Array<{ category: Category; depth: number }> {
  const children = categories.filter(
    (category) => category.parentId === parentId,
  );

  return children.flatMap((category) => [
    { category, depth },
    ...flattenCategories(categories, category.id, depth + 1),
  ]);
}

export function PostFilters({
  tab,
  trashCount,
  status,
  visibility,
  categoryId,
  categories,
  searchQuery,
  onTabChange,
  onStatusChange,
  onVisibilityChange,
  onCategoryChange,
  onSearch,
  action,
}: PostFiltersProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatCategories = useMemo(
    () => flattenCategories(categories),
    [categories],
  );
  const categoryOptions = useMemo(
    () => [
      { label: "전체 카테고리", value: "" },
      ...flatCategories.map(({ category, depth }) => ({
        label: category.name,
        value: String(category.id),
        depth,
      })),
    ],
    [flatCategories],
  );

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    onSearch(inputValue.trim());
  }

  function handleClearSearch() {
    setInputValue("");
    onSearch("");
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onTabChange("active")}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-[14px] font-medium leading-5 transition-colors",
              tab === "active"
                ? "bg-primary-1/10 text-primary-1"
                : "text-text-3 hover:text-text-2",
            )}
          >
            게시글
          </button>
          <button
            type="button"
            onClick={() => onTabChange("trash")}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-[14px] font-medium leading-5 transition-colors",
              tab === "trash"
                ? "bg-primary-1/10 text-primary-1"
                : "text-text-3 hover:text-text-2",
            )}
          >
            휴지통
            {trashCount !== undefined && trashCount > 0 ? (
              <span className="ml-1.5 text-ui-xs font-semibold text-primary-1">
                ({trashCount})
              </span>
            ) : null}
          </button>
        </div>
        {action ? (
          <div className="shrink-0 whitespace-nowrap">{action}</div>
        ) : null}
      </div>

      {tab === "active" ? (
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-center gap-3"
        >
          <DropSelect
            value={status}
            onChange={(value) => onStatusChange(value as AdminPostStatusFilter)}
            className="min-w-[8.5rem]"
            ariaLabel="상태 필터"
            options={STATUS_OPTIONS}
          />

          <DropSelect
            value={visibility}
            onChange={(value) =>
              onVisibilityChange(value as AdminPostVisibilityFilter)
            }
            className="min-w-[8.5rem]"
            ariaLabel="공개 범위 필터"
            options={VISIBILITY_OPTIONS}
          />

          <DropSelect
            value={categoryId ? String(categoryId) : ""}
            onChange={(value) =>
              onCategoryChange(value ? Number(value) : undefined)
            }
            className="min-w-[10rem]"
            ariaLabel="카테고리 필터"
            options={categoryOptions}
          />

          <div className="relative flex h-10 w-full max-w-xs min-w-[15rem] items-center">
            <Icon
              icon={magniferLinear}
              width="16"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4"
            />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="제목으로 검색..."
              className="h-10 w-full rounded-lg border border-border-3 bg-background-1 px-9 py-2 text-[14px] leading-5 text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 focus:ring-3 focus:ring-primary-1/10"
            />
            {inputValue ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-sm text-text-4 transition-colors hover:text-text-2"
                aria-label="검색 초기화"
              >
                ✕
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
