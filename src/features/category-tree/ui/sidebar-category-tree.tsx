"use client";

import Link from "next/link";
import { countVisibleCategories } from "../lib/category-counts";
import {
  EMPTY_EXPANDED_SLUGS,
  getVisibleCategoryItems,
  getVisibleChildren,
} from "../lib/tree-helpers";
import { useExpandedCategorySlugs } from "../lib/use-expanded-category-slugs";
import type { Category } from "@entities/category";
import { formatNumber } from "@shared/lib/format-number";
import { cn } from "@shared/lib/style-utils";

interface SidebarCategoryTreeProps {
  categories: Category[];
  onItemClick?: () => void;
  showOverviewLink?: boolean;
  initialExpandedSlugs?: string[];
}

function SidebarCategoryItem({
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
  const children = getVisibleChildren(category);
  const hasChildren = children.length > 0;
  const postCount = category.publishedPostCount ?? category.totalPostCount;
  const isOpen = expandedSlugs.has(category.slug);
  const itemHref = `/categories/${category.slug}`;
  const indentStyle =
    depth > 0 ? { marginLeft: `${depth * 0.875}rem` } : undefined;
  const titleClassName =
    "flex h-full min-w-0 items-center truncate text-[0.8125rem] leading-none font-medium";
  const linkClassName =
    "grid h-6 min-w-0 flex-1 grid-cols-[minmax(0,1fr)_3rem] items-center gap-2 border-b border-transparent px-1 pt-1 text-text-2 transition-colors hover:border-primary-1 hover:text-primary-1";
  const controlSlotClassName =
    "flex h-6 w-6 shrink-0 items-center justify-center";
  const countContent =
    postCount !== undefined ? (
      <span className="w-full shrink-0 text-right font-['Outfit'] text-[0.6875rem] leading-none font-medium tabular-nums text-text-4">
        {formatNumber(postCount)}
      </span>
    ) : null;

  return (
    <li>
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.slug)}
            aria-expanded={isOpen}
            aria-label={`${category.name} ${isOpen ? "접기" : "펼치기"}`}
            className={cn(
              controlSlotClassName,
              "inline-flex items-center justify-center rounded text-text-4 transition-colors hover:text-text-1 cursor-pointer hover:bg-background-4",
            )}
            style={indentStyle}
          >
            <ChevronIcon
              className={cn(
                "h-4 w-4 transition-transform duration-200 shrink-0",
                isOpen && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span
            aria-hidden="true"
            className={controlSlotClassName}
            style={indentStyle}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-text-4/45" />
          </span>
        )}
        <Link href={itemHref} onClick={onItemClick} className={linkClassName}>
          <span className={titleClassName}>{category.name}</span>
          {countContent}
        </Link>
      </div>

      {hasChildren && isOpen ? (
        <ul>
          {children.map((child) => (
            <SidebarCategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              expandedSlugs={expandedSlugs}
              onToggle={onToggle}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function SidebarCategoryTree({
  categories,
  onItemClick,
  showOverviewLink = true,
  initialExpandedSlugs = EMPTY_EXPANDED_SLUGS,
}: SidebarCategoryTreeProps) {
  const visible = getVisibleCategoryItems(categories);
  const { expandedSlugs, toggle } =
    useExpandedCategorySlugs(initialExpandedSlugs);

  if (visible.length === 0) return null;

  const totalCount = countVisibleCategories(visible);

  return (
    <div>
      {showOverviewLink && (
        <Link
          href="/categories"
          onClick={onItemClick}
          className="mb-2 flex items-center justify-between rounded px-1 py-1 text-body-sm font-medium text-text-2 transition-colors hover:text-primary-1"
        >
          <span>분류 전체보기</span>
          <span className="text-body-xs text-text-4">
            ({formatNumber(totalCount)})
          </span>
        </Link>
      )}
      <ul>
        {visible.map((category) => (
          <SidebarCategoryItem
            key={category.id}
            category={category}
            depth={0}
            expandedSlugs={expandedSlugs}
            onToggle={toggle}
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
