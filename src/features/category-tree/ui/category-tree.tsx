"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import altArrowRightLinear from "@iconify-icons/solar/alt-arrow-right-linear";
import recordLinear from "@iconify-icons/solar/record-linear";
import squareDoubleAltArrowDownLinear from "@iconify-icons/solar/square-double-alt-arrow-down-linear";
import squareDoubleAltArrowUpLinear from "@iconify-icons/solar/square-double-alt-arrow-up-linear";
import Link from "next/link";
import { countVisibleCategories } from "../lib/category-counts";
import type { Category } from "@entities/category";
import { formatNumber } from "@shared/lib/format-number";
import { cn } from "@shared/lib/style-utils";

const EMPTY_EXPANDED_SLUGS: string[] = [];

interface CategoryTreeProps {
  categories: Category[];
  onItemClick?: () => void;
  showOverviewLink?: boolean;
  initialExpandedSlugs?: string[];
  variant?: "sidebar" | "overview";
}

function getVisibleChildren(category: Category): Category[] {
  return (category.children ?? []).filter((child) => child.isVisible);
}

function getDefaultExpandedSlugs(
  categories: Category[],
  variant: "sidebar" | "overview",
): string[] {
  if (variant === "overview") {
    return categories.slice(0, 3).map((category) => category.slug);
  }

  return EMPTY_EXPANDED_SLUGS;
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
  const children = getVisibleChildren(category);
  const hasChildren = children.length > 0;
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
          {formatNumber(postCount)}
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
          {postCount !== undefined ? (
            <span className="shrink-0 text-body-xs text-text-4">
              {formatNumber(postCount)}
            </span>
          ) : null}
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
          {children.map((child) => (
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

function OverviewLeaf({
  category,
  depth,
  onItemClick,
}: {
  category: Category;
  depth: number;
  onItemClick?: () => void;
}) {
  const children = getVisibleChildren(category);
  const postCount = category.publishedPostCount ?? category.totalPostCount;

  return (
    <>
      <Link
        href={`/categories/${category.slug}`}
        onClick={onItemClick}
        className={cn(
          "group flex items-center gap-3 rounded-[0.625rem] px-2 py-2 text-[0.875rem] leading-5 text-text-2 transition-colors hover:bg-primary-1/6 hover:text-primary-1",
          depth > 0 && "pl-5",
        )}
      >
        <span
          aria-hidden="true"
          className="h-[0.3125rem] w-[0.3125rem] shrink-0 rounded-full bg-border-3 transition-colors group-hover:bg-primary-1"
        />
        <span className="min-w-0 flex-1 truncate font-medium">
          {category.name}
        </span>
        {postCount !== undefined ? (
          <span className="shrink-0 font-['Outfit'] text-[0.75rem] font-medium tabular-nums text-text-4">
            {formatNumber(postCount)}
          </span>
        ) : null}
      </Link>
      {children.map((child) => (
        <OverviewLeaf
          key={child.id}
          category={child}
          depth={depth + 1}
          onItemClick={onItemClick}
        />
      ))}
    </>
  );
}

function OverviewGroup({
  category,
  expandedSlugs,
  onToggle,
  onItemClick,
}: {
  category: Category;
  expandedSlugs: Set<string>;
  onToggle: (categorySlug: string) => void;
  onItemClick?: () => void;
}) {
  const children = getVisibleChildren(category);
  const isOpen = expandedSlugs.has(category.slug);
  const postCount = category.publishedPostCount ?? category.totalPostCount ?? 0;
  const panelId = `category-tree-panel-${category.slug}`;

  return (
    <article className="border-b border-border-4">
      <div className="flex min-h-[3.5rem] items-center gap-3 px-2 py-3 transition-colors hover:bg-background-2">
        <button
          type="button"
          onClick={() => onToggle(category.slug)}
          aria-expanded={children.length > 0 ? isOpen : undefined}
          aria-controls={children.length > 0 ? panelId : undefined}
          aria-label={`${category.name} ${isOpen ? "접기" : "펼치기"}`}
          disabled={children.length === 0}
          className={cn(
            "group flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-3 transition-colors hover:text-text-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1",
            children.length === 0 && "cursor-default",
          )}
        >
          {children.length > 0 ? (
            <Icon
              icon={altArrowRightLinear}
              width="14"
              aria-hidden="true"
              className={cn(
                "transition-transform duration-200",
                isOpen && "rotate-90 text-primary-1",
              )}
            />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-border-3" />
          )}
        </button>
        <Link
          href={`/categories/${category.slug}`}
          onClick={onItemClick}
          className="min-w-0 flex-1 truncate text-[1.0625rem] font-bold leading-[1.3] tracking-[-0.01em] text-text-1 transition-colors hover:text-primary-1"
        >
          {category.name}
        </Link>
        <span className="shrink-0 rounded-full bg-background-2 px-2.5 py-1 font-['Outfit'] text-[0.875rem] font-semibold tabular-nums text-text-3 transition-colors hover:bg-background-3 hover:text-text-1">
          {formatNumber(postCount)}
        </span>
      </div>

      {children.length > 0 ? (
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
              <div className="px-2 pb-3 pl-10 pt-1">
                {children.map((child) => (
                  <OverviewLeaf
                    key={child.id}
                    category={child}
                    depth={0}
                    onItemClick={onItemClick}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function OverviewCategoryTree({
  categories,
  expandedSlugs,
  onToggle,
  onItemClick,
  onExpandAll,
  onCollapseAll,
}: {
  categories: Category[];
  expandedSlugs: Set<string>;
  onToggle: (categorySlug: string) => void;
  onItemClick?: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}) {
  return (
    <div className="motion-reveal">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <span className="text-ui-xs font-semibold uppercase tracking-[0.04em] text-text-4">
          전체 분류
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExpandAll}
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
            onClick={onCollapseAll}
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

      <section aria-label="카테고리 트리" className="border-t border-border-4">
        {categories.map((category) => (
          <OverviewGroup
            key={category.id}
            category={category}
            expandedSlugs={expandedSlugs}
            onToggle={onToggle}
            onItemClick={onItemClick}
          />
        ))}
      </section>
    </div>
  );
}

export function CategoryTree({
  categories,
  onItemClick,
  showOverviewLink = true,
  initialExpandedSlugs = EMPTY_EXPANDED_SLUGS,
  variant = "sidebar",
}: CategoryTreeProps) {
  const visible = categories.filter((category) => category.isVisible);
  const resolvedInitialExpandedSlugs =
    initialExpandedSlugs.length > 0
      ? initialExpandedSlugs
      : getDefaultExpandedSlugs(visible, variant);
  const expandedStateKey = JSON.stringify(resolvedInitialExpandedSlugs);
  const [expandedSlugs, setExpandedSlugs] = useState(
    () => new Set(resolvedInitialExpandedSlugs),
  );

  useEffect(() => {
    setExpandedSlugs(new Set(JSON.parse(expandedStateKey) as string[]));
  }, [expandedStateKey]);

  if (visible.length === 0) return null;

  const totalCount = countVisibleCategories(visible);
  const expandableSlugs = visible
    .filter((category) => getVisibleChildren(category).length > 0)
    .map((category) => category.slug);

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

  if (variant === "overview") {
    return (
      <OverviewCategoryTree
        categories={visible}
        expandedSlugs={expandedSlugs}
        onToggle={handleToggle}
        onItemClick={onItemClick}
        onExpandAll={() => setExpandedSlugs(new Set(expandableSlugs))}
        onCollapseAll={() => setExpandedSlugs(new Set())}
      />
    );
  }

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
