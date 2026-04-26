"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import recordLinear from "@iconify-icons/solar/record-linear";
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
  const itemHref = `/categories/${category.slug}`;
  const itemContent = (
    <>
      <span className={cn("truncate", isOverview && "font-medium")}>
        {category.name}
      </span>
      {postCount !== undefined && (
        <span
          className={cn(
            "shrink-0 text-body-xs text-text-4",
            isOverview &&
              "rounded-full border border-border-3 bg-background-1 px-2 py-0.5 font-medium text-text-3",
          )}
        >
          {postCount}
        </span>
      )}
    </>
  );

  if (!hasChildren && !isOverview) {
    return (
      <li>
        <Link
          href={itemHref}
          onClick={onItemClick}
          className="flex items-center justify-between gap-2 py-1 text-body-sm text-text-2 transition-colors hover:text-primary-1"
          style={{ paddingLeft: `${depth * 0.75 + 1}rem` }}
        >
          <span className="flex min-w-0 items-center gap-1.5 font-medium">
            <Icon
              icon={recordLinear}
              width="12"
              aria-hidden="true"
              className="shrink-0 text-text-4"
            />
            <span className="truncate">{category.name}</span>
          </span>
          {postCount !== undefined && (
            <span className="shrink-0 text-body-xs text-text-4">
              {postCount}
            </span>
          )}
        </Link>
      </li>
    );
  }

  return (
    <li className={cn(isOverview && "mt-1 first:mt-0")}>
      <div
        className={cn(
          "flex items-center gap-1.5",
          isOverview &&
            "rounded-md border border-border-3 border-l-2 border-l-primary-1/40 bg-background-2/70 px-2.5 py-1.5 transition-colors hover:border-border-2 hover:border-l-primary-1 hover:bg-background-3/60",
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
              isOverview ? "h-7 w-7 bg-background-1" : "h-5 w-5",
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
          <span
            aria-hidden="true"
            className={cn(
              "flex shrink-0 items-center justify-center",
              isOverview ? "h-7 w-7" : "h-5 w-5",
            )}
          >
            <span
              className={cn(
                "rounded-full bg-text-4/45",
                isOverview ? "h-1.5 w-1.5" : "h-1 w-1",
              )}
            />
          </span>
        )}
        <Link
          href={itemHref}
          onClick={onItemClick}
          className={cn(
            "flex flex-1 items-center justify-between gap-2 rounded transition-colors hover:text-primary-1",
            isOverview
              ? "px-1 py-0.5 text-body-sm text-text-1"
              : "px-1 py-1 text-body-sm text-text-2",
          )}
        >
          {itemContent}
        </Link>
      </div>

      {hasChildren && isOpen && (
        <ul
          className={cn(
            isOverview && "mt-1 ml-4 border-l border-border-3 pl-2",
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
