"use client";

import { useCallback, useState } from "react";
import type { Category } from "@entities/category";
import { cn } from "@shared/lib/style-utils";
import { EmptyState } from "@shared/ui/libs";
import { ToggleSwitch } from "@shared/ui/toggle-switch";

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function collectVisibleNonLeafIds(
  categories: Category[],
  showHidden: boolean,
): Set<number> {
  const ids = new Set<number>();
  function traverse(cats: Category[]) {
    for (const cat of cats) {
      const visible = showHidden
        ? (cat.children ?? [])
        : (cat.children ?? []).filter((c) => c.isVisible);
      if (visible.length > 0) {
        ids.add(cat.id);
        traverse(visible);
      }
    }
  }
  traverse(categories);

  return ids;
}

function CategoryTreeRow({
  category,
  depth,
  expandedIds,
  showHidden,
  onToggle,
  onEdit,
  onDelete,
}: {
  category: Category;
  depth: number;
  expandedIds: Set<number>;
  showHidden: boolean;
  onToggle: (id: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const visibleChildren = showHidden
    ? (category.children ?? [])
    : (category.children ?? []).filter((c) => c.isVisible);
  const hasVisibleChildren = visibleChildren.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isHidden = !category.isVisible;

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-background-3/50",
          isHidden && "opacity-50",
        )}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        <button
          type="button"
          onClick={() => onToggle(category.id)}
          disabled={!hasVisibleChildren}
          aria-label="하위 카테고리 토글"
          aria-expanded={hasVisibleChildren ? isExpanded : undefined}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center text-xs text-text-3 transition-colors",
            hasVisibleChildren
              ? "cursor-pointer hover:text-text-1"
              : "cursor-default",
          )}
        >
          {hasVisibleChildren ? (isExpanded ? "▼" : "▶") : null}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate font-medium text-text-1">
            {category.name}
          </span>
          {isHidden && (
            <span className="shrink-0 text-sm text-text-3">(숨김)</span>
          )}
          <span className="shrink-0 rounded-full bg-background-3 px-2 py-0.5 text-xs text-text-4">
            {category.slug}
          </span>
        </div>

        <span className="shrink-0 text-sm text-text-3">
          발행 {category.publishedPostCount ?? 0} / 전체{" "}
          {category.totalPostCount ?? 0}
        </span>

        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="inline-flex items-center justify-center rounded-[0.75rem] border border-negative-1/30 px-3 py-1.5 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
          >
            삭제
          </button>
        </div>
      </div>

      {hasVisibleChildren && isExpanded ? (
        <ul>
          {visibleChildren.map((child) => (
            <CategoryTreeRow
              key={child.id}
              category={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              showHidden={showHidden}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  const visibleRootCategories = showHidden
    ? categories
    : categories.filter((c) => c.isVisible);

  const handleToggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedIds(collectVisibleNonLeafIds(categories, showHidden));
  }, [categories, showHidden]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  if (categories.length === 0) {
    return (
      <EmptyState message="카테고리가 없습니다. 새 카테고리를 생성하세요." />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleExpandAll}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          전체 펼침
        </button>
        <button
          type="button"
          onClick={handleCollapseAll}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          전체 접힘
        </button>
        <label className="flex cursor-pointer items-center gap-2">
          <ToggleSwitch
            checked={showHidden}
            onChange={setShowHidden}
            aria-label="숨김 카테고리 표시"
          />
          <span className="text-sm text-text-3">
            숨김 표시 {showHidden ? "on" : "off"}
          </span>
        </label>
      </div>

      <ul>
        {visibleRootCategories.map((category) => (
          <CategoryTreeRow
            key={category.id}
            category={category}
            depth={0}
            expandedIds={expandedIds}
            showHidden={showHidden}
            onToggle={handleToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
