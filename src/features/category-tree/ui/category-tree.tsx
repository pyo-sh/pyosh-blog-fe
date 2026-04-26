"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
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

function collectExpandableSlugs(categories: Category[]): string[] {
  return categories.flatMap((category) => {
    const children = getVisibleChildren(category);

    if (children.length === 0) {
      return [];
    }

    return [category.slug, ...collectExpandableSlugs(children)];
  });
}

function getDefaultExpandedSlugs(
  categories: Category[],
  variant: "sidebar" | "overview",
): string[] {
  if (variant === "overview") {
    return collectExpandableSlugs(categories.slice(0, 3));
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
  const isOverviewRoot = isOverview && depth === 0;
  const itemHref = `/categories/${category.slug}`;
  const panelId = `category-tree-panel-${variant}-${category.slug}`;
  const indentStyle =
    depth > 0 ? { marginLeft: `${depth * 0.75}rem` } : undefined;
  const titleClassName = cn(
    "min-w-0 truncate",
    isOverviewRoot
      ? "text-[1.0625rem] font-bold leading-[1.2]"
      : "text-[0.8125rem] font-medium leading-[1.2]",
  );
  const countColumnClassName = isOverview
    ? "grid-cols-[minmax(0,1fr)_3.5rem]"
    : "grid-cols-[minmax(0,1fr)_3rem]";
  const countContent =
    postCount !== undefined ? (
      <span className="w-full shrink-0 text-right font-['Outfit'] text-[0.6875rem] leading-none font-medium tabular-nums text-text-4">
        {formatNumber(postCount)}
      </span>
    ) : null;

  if (!hasChildren && !isOverview) {
    return (
      <li>
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center"
            style={indentStyle}
          >
            <span className="h-2 w-2 rounded-full bg-text-4/45" />
          </span>
          <Link
            href={itemHref}
            onClick={onItemClick}
            className={cn(
              "grid min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-text-2 transition-colors hover:text-primary-1",
              countColumnClassName,
            )}
          >
            <span className={titleClassName}>{category.name}</span>
            {countContent}
          </Link>
        </div>
      </li>
    );
  }

  return (
    <li className={cn(isOverview && depth > 0 && "mt-1 first:mt-0")}>
      <div
        className={cn(
          "flex items-center gap-1.5",
          isOverview &&
            cn(
              "transition-colors hover:bg-background-2/80",
              depth === 0 ? "px-2.5 py-2.5" : "py-1 pr-1",
            ),
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.slug)}
            aria-expanded={isOpen}
            aria-controls={isOverview ? panelId : undefined}
            aria-label={`${category.name} ${isOpen ? "접기" : "펼치기"}`}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-4 transition-colors hover:text-text-1"
            style={
              isOverview ? indentStyle : { marginLeft: `${depth * 0.75}rem` }
            }
          >
            <ChevronIcon
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isOpen && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center"
            style={
              isOverview ? indentStyle : { marginLeft: `${depth * 0.75}rem` }
            }
          >
            {isOverview ? (
              <span className="h-2 w-2 rounded-full bg-text-4/45" />
            ) : (
              <Icon
                icon={recordLinear}
                width="8"
                aria-hidden="true"
                className="h-2 w-2 shrink-0 text-text-4"
              />
            )}
          </span>
        )}
        <Link
          href={itemHref}
          onClick={onItemClick}
          className={cn(
            "grid min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-text-2 transition-colors hover:text-primary-1",
            countColumnClassName,
          )}
        >
          <span className={titleClassName}>{category.name}</span>
          {countContent}
        </Link>
      </div>

      {hasChildren ? (
        isOverview ? (
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
                <ul className="mt-0.5 pb-2">
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
              ) : null}
            </div>
          </div>
        ) : isOpen ? (
          <ul>
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
        ) : null
      ) : null}
    </li>
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

      <section
        aria-label="카테고리 트리"
        className="overflow-hidden rounded-[0.875rem] border border-border-4 bg-background-1"
      >
        <ul className="divide-y divide-border-4">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              depth={0}
              expandedSlugs={expandedSlugs}
              onToggle={onToggle}
              onItemClick={onItemClick}
              variant="overview"
            />
          ))}
        </ul>
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
  const expandableSlugs = collectExpandableSlugs(visible);

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
