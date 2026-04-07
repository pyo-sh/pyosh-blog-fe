"use client";

import type { ReactNode } from "react";
import {
  type FormEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "@iconify/react";
import altArrowDownLinear from "@iconify-icons/solar/alt-arrow-down-linear";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import type { Category } from "@entities/category";
import type { PostListItem } from "@entities/post";
import { cn } from "@shared/lib/style-utils";

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

function FilterSelect({
  value,
  onChange,
  className,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
  options: Array<{
    label: string;
    value: string;
    depth?: number;
  }>;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const next = optionRefs.current[activeIndex];
    if (!next) return;

    const frame = requestAnimationFrame(() => next.focus());

    return () => cancelAnimationFrame(frame);
  }, [activeIndex, open]);

  function openList(index = selectedIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function closeList() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function selectValue(nextValue: string) {
    onChange(nextValue);
    closeList();
  }

  function moveActive(nextIndex: number) {
    const maxIndex = options.length - 1;
    setActiveIndex(Math.min(Math.max(nextIndex, 0), maxIndex));
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openList(selectedIndex))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openList(selectedIndex);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openList(selectedIndex);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openList(selectedIndex);
          }
        }}
        className={cn(
          "flex h-10 w-full items-center rounded-lg border border-border-3 bg-background-1 px-3 py-2 pr-8 text-left text-[14px] leading-5 text-text-1 outline-none transition-colors",
          open && "border-primary-1 ring-3 ring-primary-1/10",
        )}
      >
        <span className="truncate whitespace-nowrap">
          {selectedOption?.label ?? ""}
        </span>
        <Icon
          icon={altArrowDownLinear}
          width="14"
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-4 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[200] min-w-full overflow-hidden rounded-lg border border-border-3 bg-background-1 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
          <div
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className="py-0.5"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => selectValue(option.value)}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveActive(index + 1);
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveActive(index - 1);
                    } else if (event.key === "Home") {
                      event.preventDefault();
                      moveActive(0);
                    } else if (event.key === "End") {
                      event.preventDefault();
                      moveActive(options.length - 1);
                    } else if (event.key === "Escape") {
                      event.preventDefault();
                      closeList();
                    } else if (event.key === "Tab") {
                      setOpen(false);
                    } else if (event.key === " " || event.key === "Enter") {
                      event.preventDefault();
                      selectValue(option.value);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center whitespace-nowrap px-3 py-2 text-left text-[14px] leading-5 text-text-1 transition-colors hover:bg-background-2",
                    isSelected && "font-medium text-primary-1",
                  )}
                  style={{
                    paddingLeft: option.depth
                      ? `${12 + option.depth * 16}px`
                      : undefined,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
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
          <FilterSelect
            value={status}
            onChange={(value) => onStatusChange(value as AdminPostStatusFilter)}
            className="min-w-[8.5rem]"
            ariaLabel="상태 필터"
            options={STATUS_OPTIONS}
          />

          <FilterSelect
            value={visibility}
            onChange={(value) =>
              onVisibilityChange(value as AdminPostVisibilityFilter)
            }
            className="min-w-[8.5rem]"
            ariaLabel="공개 범위 필터"
            options={VISIBILITY_OPTIONS}
          />

          <FilterSelect
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
