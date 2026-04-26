"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { countVisibleCategories } from "../lib/category-counts";
import type { Category } from "@entities/category";
import { cn } from "@shared/lib/style-utils";

const EMPTY_EXPANDED_SLUGS: string[] = [];

interface CategoryTreeProps {
  categories: Category[];
  onItemClick?: () => void;
  showOverviewLink?: boolean;
  initialExpandedSlugs?: string[];
}

function CategoryItem({
  category,
  depth,
  expandedSlugs,
  onToggle,
  onItemClick,
}: {
  category: Category;
  depth: number;
  expandedSlugs: Set<string>;
  onToggle: (categorySlug: string) => void;
  onItemClick?: () => void;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const postCount = category.publishedPostCount ?? category.totalPostCount;
  const isOpen = expandedSlugs.has(category.slug);

  return (
    <li>
      <div
        className="flex items-center gap-1"
        style={{ paddingLeft: `${depth * 0.75}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.slug)}
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
              expandedSlugs={expandedSlugs}
              onToggle={onToggle}
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
  initialExpandedSlugs = EMPTY_EXPANDED_SLUGS,
}: CategoryTreeProps) {
  const visible = categories.filter((c) => c.isVisible);
  const [expandedSlugs, setExpandedSlugs] = useState(
    () => new Set(initialExpandedSlugs),
  );

  useEffect(() => {
    setExpandedSlugs(new Set(initialExpandedSlugs));
  }, [initialExpandedSlugs]);

  if (visible.length === 0) return null;

  const totalCount = countVisibleCategories(visible);
  const handleToggle = (categorySlug: string) => {
    setExpandedSlugs((current) => {
      const next = new Set(current);

      if (next.has(categorySlug)) {
        next.delete(categorySlug);
      } else {
        next.add(categorySlug);
      }

      return next;
    });
  };

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
            expandedSlugs={expandedSlugs}
            onToggle={handleToggle}
            onItemClick={onItemClick}
          />
        ))}
      </ul>
    </div>
  );
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
