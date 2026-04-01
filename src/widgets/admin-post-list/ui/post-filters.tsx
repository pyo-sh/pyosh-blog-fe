"use client";

import {
  type FormEvent,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "@iconify/react";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import type { Category } from "@entities/category";
import type { Post } from "@entities/post";
import { cn } from "@shared/lib/style-utils";

export type AdminPostTab = "active" | "trash";
export type AdminPostStatusFilter = Post["status"] | "all";
export type AdminPostVisibilityFilter = Post["visibility"] | "all";

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

function FilterSelect({
  value,
  onChange,
  className,
  children,
  ariaLabel,
}: PropsWithChildren<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
}>) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23838c95' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 12px center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "12px 8px",
      }}
      className={cn(
        "min-w-[8.5rem] appearance-none rounded-lg border border-border-3 bg-background-1",
        "px-3 py-2 pr-9 text-body-sm text-text-1 outline-none transition-colors",
        "focus:border-primary-1 focus:ring-3 focus:ring-primary-1/10",
        className,
      )}
    >
      {children}
    </select>
  );
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
}: PostFiltersProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatCategories = useMemo(
    () => flattenCategories(categories),
    [categories],
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
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onTabChange("active")}
          className={cn(
            "rounded-lg px-3 py-2 text-body-sm font-medium transition-colors",
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
            "rounded-lg px-3 py-2 text-body-sm font-medium transition-colors",
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

      {tab === "active" ? (
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-center gap-3"
        >
          <FilterSelect
            value={status}
            onChange={(value) => onStatusChange(value as AdminPostStatusFilter)}
            ariaLabel="상태 필터"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={visibility}
            onChange={(value) =>
              onVisibilityChange(value as AdminPostVisibilityFilter)
            }
            ariaLabel="공개 범위 필터"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={categoryId ? String(categoryId) : ""}
            onChange={(value) =>
              onCategoryChange(value ? Number(value) : undefined)
            }
            className="min-w-[10rem]"
            ariaLabel="카테고리 필터"
          >
            <option value="">전체 카테고리</option>
            {flatCategories.map(({ category, depth }) => (
              <option key={category.id} value={category.id}>
                {`${" ".repeat(depth * 2)}${category.name}`}
              </option>
            ))}
          </FilterSelect>

          <div className="relative w-full max-w-xs min-w-[15rem]">
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
              className="w-full rounded-lg border border-border-3 bg-background-1 px-9 py-2 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 focus:ring-3 focus:ring-primary-1/10"
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
