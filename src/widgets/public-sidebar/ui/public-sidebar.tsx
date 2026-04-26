"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import altArrowRightLinear from "@iconify-icons/solar/alt-arrow-right-linear";
import closeCircleLinear from "@iconify-icons/solar/close-circle-linear";
import eyeLinear from "@iconify-icons/solar/eye-linear";
import folder2Linear from "@iconify-icons/solar/folder-2-linear";
import tagLinear from "@iconify-icons/solar/tag-linear";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@entities/category";
import type { PostListItem } from "@entities/post";
import type { PopularPost, TotalViewsStats } from "@entities/stat";
import type { Tag } from "@entities/tag";
import type { TocItem } from "@shared/lib/markdown";
import { CategoryTree, countVisibleCategories } from "@features/category-tree";
import { RecentPopularPosts } from "@features/recent-popular-posts";
import { TagCloud } from "@features/tag-cloud";
import { TocSection } from "@features/toc";
import { TotalViewCount } from "@features/total-view-count";
import { cn } from "@shared/lib/style-utils";

interface PublicSidebarContentProps {
  recentPosts: PostListItem[];
  popularPosts: PopularPost[] | null;
  categories: Category[];
  tags: Tag[];
  totalViews: TotalViewsStats | null;
  headings?: TocItem[];
  onItemClick?: () => void;
}

interface PublicSidebarPanelProps extends PublicSidebarContentProps {
  onClose?: () => void;
  className?: string;
}

const POST_TOC_DATA_ID = "post-toc-data";
const SIDEBAR_CATEGORY_PATH_DATA_ID = "sidebar-category-path-data";

function SidebarSection({
  title,
  icon,
  action,
  className,
  children,
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("border-b border-border-4 py-4 last:border-b-0", className)}
    >
      {title && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-ui-xs font-bold uppercase tracking-[0.04em] text-text-4">
            {icon}
            <span>{title}</span>
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PublicSidebarContent({
  recentPosts,
  popularPosts,
  categories,
  tags,
  totalViews,
  headings,
  onItemClick,
}: PublicSidebarContentProps) {
  const pathname = usePathname();
  const [pageHeadings, setPageHeadings] = useState<TocItem[]>([]);
  const [initialExpandedCategorySlugs, setInitialExpandedCategorySlugs] =
    useState<string[]>([]);

  useEffect(() => {
    if (headings) {
      setPageHeadings(headings);

      return;
    }

    if (!pathname?.startsWith("/posts/")) {
      setPageHeadings([]);

      return;
    }

    setPageHeadings(readTocDataFromDocument());
  }, [headings, pathname]);

  useEffect(() => {
    if (!pathname) {
      setInitialExpandedCategorySlugs([]);

      return;
    }

    if (pathname.startsWith("/categories/") || pathname.startsWith("/posts/")) {
      const categoryPathSlugs = readCategoryPathDataFromDocument();

      setInitialExpandedCategorySlugs(categoryPathSlugs.slice(0, -1));

      return;
    }

    setInitialExpandedCategorySlugs([]);
  }, [pathname]);

  const tocHeadings = headings ?? pageHeadings;
  const visibleCategoryCount = countVisibleCategories(categories);

  return (
    <div>
      {tocHeadings.length > 0 && (
        <SidebarSection title="목차">
          <TocSection headings={tocHeadings} onItemClick={onItemClick} />
        </SidebarSection>
      )}

      <SidebarSection className={tocHeadings.length > 0 ? undefined : "pt-0"}>
        <RecentPopularPosts
          recentPosts={recentPosts}
          popularPosts={popularPosts}
          onItemClick={onItemClick}
        />
      </SidebarSection>

      {categories.some((c) => c.isVisible) && (
        <SidebarSection
          title={`카테고리 (${visibleCategoryCount})`}
          icon={<Icon icon={folder2Linear} width="13" aria-hidden="true" />}
          action={
            <Link
              href="/categories"
              onClick={onItemClick}
              className="inline-flex items-center gap-0.5 text-ui-xs font-medium text-primary-1 underline-offset-4 hover:underline"
            >
              전체보기
              <Icon icon={altArrowRightLinear} width="10" aria-hidden="true" />
            </Link>
          }
        >
          <CategoryTree
            categories={categories}
            onItemClick={onItemClick}
            showOverviewLink={false}
            initialExpandedSlugs={initialExpandedCategorySlugs}
          />
        </SidebarSection>
      )}

      {tags.length > 0 && (
        <SidebarSection
          title="태그"
          icon={<Icon icon={tagLinear} width="13" aria-hidden="true" />}
          action={
            <Link
              href="/tags"
              className="inline-flex items-center gap-0.5 text-ui-xs font-medium text-primary-1 underline-offset-4 hover:underline"
            >
              전체보기
              <Icon icon={altArrowRightLinear} width="10" aria-hidden="true" />
            </Link>
          }
        >
          <TagCloud tags={tags} showViewAllLink={false} />
        </SidebarSection>
      )}

      {totalViews !== null && (
        <SidebarSection
          title="블로그 조회수"
          icon={<Icon icon={eyeLinear} width="13" aria-hidden="true" />}
        >
          <TotalViewCount totalPageviews={totalViews.totalPageviews} />
        </SidebarSection>
      )}
    </div>
  );
}

export function PublicSidebarPanel({
  recentPosts,
  popularPosts,
  categories,
  tags,
  totalViews,
  headings,
  onItemClick,
  onClose,
  className,
}: PublicSidebarPanelProps) {
  return (
    <div className={cn("bg-background-1 px-5 pb-8", className)}>
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between bg-background-1">
        <span className="text-body-sm font-bold text-text-1">메뉴</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="메뉴 닫기"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3"
        >
          <Icon icon={closeCircleLinear} width="20" aria-hidden="true" />
        </button>
      </div>

      <PublicSidebarContent
        recentPosts={recentPosts}
        popularPosts={popularPosts}
        categories={categories}
        tags={tags}
        totalViews={totalViews}
        headings={headings}
        onItemClick={onItemClick}
      />
    </div>
  );
}

function readTocDataFromDocument(): TocItem[] {
  const element = document.getElementById(POST_TOC_DATA_ID);

  if (!element?.textContent) {
    return [];
  }

  try {
    const parsed = JSON.parse(element.textContent) as TocItem[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item?.id === "string" &&
        typeof item?.text === "string" &&
        (item?.level === 1 || item?.level === 2 || item?.level === 3),
    );
  } catch {
    return [];
  }
}

function readCategoryPathDataFromDocument(): string[] {
  const element = document.getElementById(SIDEBAR_CATEGORY_PATH_DATA_ID);

  if (!element?.textContent) {
    return [];
  }

  try {
    const parsed = JSON.parse(element.textContent) as string[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

// Smart-sticky sidebar: follows scroll when content is taller than viewport
interface StickyWrapperProps {
  children: React.ReactNode;
}

export function StickySidebarWrapper({ children }: StickyWrapperProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const currentTop = useRef(72);

  useEffect(() => {
    const NAV_HEIGHT = 72;
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const el = sidebarRef.current;
      if (!el) return;

      const sidebarHeight = el.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;

      if (sidebarHeight <= viewportHeight - NAV_HEIGHT) {
        // Short sidebar: stay at top
        currentTop.current = NAV_HEIGHT;
      } else {
        const delta = scrollY - lastScrollY.current;
        // Scrolling down: sidebar top decreases (content scrolls up with page)
        // Scrolling up: sidebar top increases back toward NAV_HEIGHT
        const minTop = viewportHeight - sidebarHeight;
        const maxTop = NAV_HEIGHT;
        currentTop.current = Math.min(
          maxTop,
          Math.max(minTop, currentTop.current - delta),
        );
      }

      el.style.top = `${currentTop.current}px`;
      lastScrollY.current = scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={sidebarRef} className="sticky" style={{ top: "72px" }}>
      {children}
    </div>
  );
}
