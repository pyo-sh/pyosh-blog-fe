"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Category } from "@entities/category";
import type { Post } from "@entities/post";
import type { PopularPost, TotalViewsStats } from "@entities/stat";
import type { Tag } from "@entities/tag";
import type { TocItem } from "@shared/lib/markdown";
import { CategoryTree } from "@features/category-tree";
import { RecentPopularPosts } from "@features/recent-popular-posts";
import { TagCloud } from "@features/tag-cloud";
import { TocSection } from "@features/toc";
import { TotalViewCount } from "@features/total-view-count";

interface PublicSidebarContentProps {
  recentPosts: Post[];
  popularPosts: PopularPost[] | null;
  categories: Category[];
  tags: Tag[];
  totalViews: TotalViewsStats | null;
  headings?: TocItem[];
  onItemClick?: () => void;
}

const POST_TOC_DATA_ID = "post-toc-data";

function SidebarSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-4">
      {title && (
        <h2 className="mb-3 text-body-xs font-semibold uppercase tracking-[0.16em] text-text-4">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function SidebarDivider() {
  return <hr className="border-border-3" />;
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

  const tocHeadings = headings ?? pageHeadings;

  return (
    <>
      {tocHeadings.length > 0 && (
        <>
          <SidebarSection>
            <TocSection headings={tocHeadings} onItemClick={onItemClick} />
          </SidebarSection>
          <SidebarDivider />
        </>
      )}

      <SidebarSection>
        <RecentPopularPosts
          recentPosts={recentPosts}
          popularPosts={popularPosts}
          onItemClick={onItemClick}
        />
      </SidebarSection>

      {categories.some((c) => c.isVisible) && (
        <>
          <SidebarDivider />
          <SidebarSection title="분류">
            <CategoryTree categories={categories} onItemClick={onItemClick} />
          </SidebarSection>
        </>
      )}

      {tags.length > 0 && (
        <>
          <SidebarDivider />
          <SidebarSection title="태그">
            <TagCloud tags={tags} />
          </SidebarSection>
        </>
      )}

      {totalViews !== null && (
        <>
          <SidebarDivider />
          <SidebarSection>
            <TotalViewCount totalPageviews={totalViews.totalPageviews} />
          </SidebarSection>
        </>
      )}
    </>
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
