"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@entities/category";
import { cn } from "@shared/lib/style-utils";

interface CategoryTreeProps {
  categories: Category[];
  onItemClick?: () => void;
  showOverviewLink?: boolean;
}

function countTotal(categories: Category[]): number {
  return categories.reduce((sum, cat) => {
    const childCount = cat.children ? countTotal(cat.children) : 0;

    return sum + (cat.publishedPostCount ?? 0) + childCount;
  }, 0);
}

function CategoryItem({
  category,
  depth,
  onItemClick,
}: {
  category: Category;
  depth: number;
  onItemClick?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const postCount = category.publishedPostCount ?? category.totalPostCount;

  return (
    <li>
      <div
        className="flex items-center gap-1"
        style={{ paddingLeft: `${depth * 0.75}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-label={`${category.name} ${isOpen ? "접기" : "펼치기"}`}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-4 transition-colors hover:text-text-1"
          >
            <ChevronIcon
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isOpen && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <Link
          href={`/categories/${category.slug}`}
          onClick={onItemClick}
          className="flex flex-1 items-center justify-between gap-2 rounded px-1 py-1.5 text-body-sm text-text-2 transition-colors hover:text-primary-1"
        >
          <span className="truncate">{category.name}</span>
          {postCount !== undefined && (
            <span className="shrink-0 text-body-xs text-text-4">
              {postCount}
            </span>
          )}
        </Link>
      </div>

      {hasChildren && isOpen && (
        <ul>
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryTree({
  categories,
  onItemClick,
  showOverviewLink = true,
}: CategoryTreeProps) {
  const visible = categories.filter((c) => c.isVisible);

  if (visible.length === 0) return null;

  const totalCount = countTotal(visible);

  return (
    <div>
      {showOverviewLink && (
        <Link
          href="/categories"
          onClick={onItemClick}
          className="mb-2 flex items-center justify-between rounded px-1 py-1 text-body-sm font-medium text-text-2 transition-colors hover:text-primary-1"
        >
          <span>분류 전체보기</span>
          <span className="text-body-xs text-text-4">({totalCount})</span>
        </Link>
      )}
      <ul>
        {visible.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            depth={0}
            onItemClick={onItemClick}
          />
        ))}
      </ul>
    </div>
  );
}

export function countVisibleCategories(categories: Category[]) {
  return countTotal(categories.filter((category) => category.isVisible));
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
