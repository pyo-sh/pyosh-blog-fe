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
  variant?: "sidebar" | "overview";
}

function CategoryItem({
  category,
  depth,
  expandedSlugs,
  onToggle,
  onItemClick,
  variant,
}: {
  category: Category;
  depth: number;
  expandedSlugs: Set<string>;
  onToggle: (categorySlug: string) => void;
  onItemClick?: () => void;
  variant: "sidebar" | "overview";
}) {
  const hasChildren = category.children && category.children.length > 0;
  const postCount = category.publishedPostCount ?? category.totalPostCount;
  const isOpen = expandedSlugs.has(category.slug);
  const isOverview = variant === "overview";

  return (
    <li className={cn(isOverview && "mt-3 first:mt-0")}>
      <div
        className={cn(
          "flex items-center gap-1",
          isOverview &&
            "rounded-[1.4rem] border border-border-3 bg-background-2 px-3 py-2.5 shadow-[0_14px_34px_rgba(15,23,42,0.04)] transition-colors hover:border-border-2",
        )}
        style={{ paddingLeft: `${depth * 0.75}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.slug)}
            aria-expanded={isOpen}
            aria-label={`${category.name} ${isOpen ? "접기" : "펼치기"}`}
            className={cn(
              "flex shrink-0 items-center justify-center rounded text-text-4 transition-colors hover:text-text-1",
              isOverview ? "h-8 w-8 bg-background-1" : "h-5 w-5",
            )}
          >
            <ChevronIcon
              className={cn(
                "transition-transform duration-200",
                isOverview ? "h-4 w-4" : "h-3.5 w-3.5",
                isOpen && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className={cn("shrink-0", isOverview ? "w-8" : "w-5")} />
        )}
        <Link
          href={`/categories/${category.slug}`}
          onClick={onItemClick}
          className={cn(
            "flex flex-1 items-center justify-between gap-2 rounded transition-colors hover:text-primary-1",
            isOverview
              ? "px-1 py-0.5 text-[0.95rem] text-text-1"
              : "px-1 py-1.5 text-body-sm text-text-2",
          )}
        >
          <span className="truncate font-medium">{category.name}</span>
          {postCount !== undefined && (
            <span
              className={cn(
                "shrink-0 text-body-xs text-text-4",
                isOverview &&
                  "rounded-full border border-border-3 bg-background-1 px-2.5 py-1 font-medium text-text-3",
              )}
            >
              {postCount}
            </span>
          )}
        </Link>
      </div>

      {hasChildren && isOpen && (
        <ul
          className={cn(
            isOverview && "ml-4 border-l border-dashed border-border-3 pl-2",
          )}
        >
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              expandedSlugs={expandedSlugs}
              onToggle={onToggle}
              onItemClick={onItemClick}
              variant={variant}
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
  variant = "sidebar",
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
          className={cn(
            "mb-2 flex items-center justify-between rounded px-1 py-1 text-body-sm font-medium text-text-2 transition-colors hover:text-primary-1",
            variant === "overview" &&
              "mb-4 rounded-[1.2rem] border border-dashed border-border-3 bg-background-2 px-4 py-3",
          )}
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
            variant={variant}
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
