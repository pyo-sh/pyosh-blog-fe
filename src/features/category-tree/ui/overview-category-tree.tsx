"use client";

import { Icon } from "@iconify/react";
import squareDoubleAltArrowDownLinear from "@iconify-icons/solar/square-double-alt-arrow-down-linear";
import squareDoubleAltArrowUpLinear from "@iconify-icons/solar/square-double-alt-arrow-up-linear";
import Link from "next/link";
import {
  collectExpandableSlugs,
  getVisibleCategoryItems,
  getVisibleChildren,
} from "../lib/tree-helpers";
import { useExpandedCategorySlugs } from "../lib/use-expanded-category-slugs";
import type { Category } from "@entities/category";
import { formatNumber } from "@shared/lib/format-number";
import { cn } from "@shared/lib/style-utils";

interface OverviewCategoryTreeProps {
  categories: Category[];
  onItemClick?: () => void;
}

function OverviewCategoryItem({
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
  const isRoot = depth === 0;
  const itemHref = `/categories/${category.slug}`;
  const panelId = `category-tree-panel-overview-${category.slug}`;
  const indentStyle =
    depth > 0 ? { marginLeft: `${depth * 1.25}rem` } : undefined;
  const titleClassName = cn(
    "flex h-full min-w-0 items-center truncate leading-none",
    isRoot ? "text-[1.125rem] font-bold" : "text-[0.875rem] font-medium",
  );
  const countContent =
    postCount !== undefined ? (
      <span className="w-full shrink-0 text-right font-['Outfit'] text-[0.6875rem] leading-none font-medium tabular-nums text-text-4">
        {formatNumber(postCount)}
      </span>
    ) : null;

  return (
    <li className={cn(depth > 0 && "mt-1 first:mt-0")}>
      <div
        className={cn(
          "flex items-center gap-1.5 transition-colors [&:has(a:hover)]:bg-background-2/80",
          isRoot ? "h-[2.875rem] p-2.5" : "h-9 p-1.5 pr-2.5",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.slug)}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${category.name} ${isOpen ? "접기" : "펼치기"}`}
            className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-text-4 transition-colors hover:bg-background-4 hover:text-text-1"
            style={indentStyle}
          >
            <ChevronIcon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                isOpen && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center"
            style={indentStyle}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-text-4/45" />
          </span>
        )}
        <Link
          href={itemHref}
          onClick={onItemClick}
          className={cn(
            "grid h-full min-w-0 flex-1 grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-2 rounded px-1 pt-1 text-text-2 transition-colors hover:text-primary-1",
          )}
        >
          <span className={titleClassName}>{category.name}</span>
          {countContent}
        </Link>
      </div>

      {hasChildren ? (
        <div
          id={panelId}
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
          aria-hidden={!isOpen}
        >
          <div className="overflow-hidden">
            {isOpen ? (
              <ul className="mt-0.5">
                {children.map((child) => (
                  <OverviewCategoryItem
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
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function OverviewCategoryTree({
  categories,
  onItemClick,
}: OverviewCategoryTreeProps) {
  const visible = getVisibleCategoryItems(categories);
  const defaultExpandedSlugs = collectExpandableSlugs(visible.slice(0, 3));
  const expandableSlugs = collectExpandableSlugs(visible);
  const { expandedSlugs, toggle, expandAll, collapseAll } =
    useExpandedCategorySlugs(defaultExpandedSlugs);

  if (visible.length === 0) return null;

  return (
    <div className="motion-reveal">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <span className="text-ui-xs font-semibold uppercase tracking-[0.04em] text-text-4">
          전체 분류
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => expandAll(expandableSlugs)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-[0.8125rem] font-medium text-text-3 transition-colors hover:border-border-4 hover:bg-background-2 hover:text-text-1"
          >
            <Icon
              icon={squareDoubleAltArrowDownLinear}
              width="14"
              aria-hidden="true"
            />
            모두 펼치기
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-[0.8125rem] font-medium text-text-3 transition-colors hover:border-border-4 hover:bg-background-2 hover:text-text-1"
          >
            <Icon
              icon={squareDoubleAltArrowUpLinear}
              width="14"
              aria-hidden="true"
            />
            모두 접기
          </button>
        </div>
      </div>

      <section
        aria-label="카테고리 트리"
        className="overflow-hidden rounded-[0.875rem] border border-border-4 bg-background-1"
      >
        <ul className="divide-y divide-border-4">
          {visible.map((category) => (
            <OverviewCategoryItem
              key={category.id}
              category={category}
              depth={0}
              expandedSlugs={expandedSlugs}
              onToggle={toggle}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      </section>
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
