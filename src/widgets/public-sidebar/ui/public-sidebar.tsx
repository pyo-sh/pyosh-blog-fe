"use client";

import { useEffect, useRef } from "react";
import type { Category } from "@entities/category";
import type { Post } from "@entities/post";
import type { PopularPost, TotalViewsStats } from "@entities/stat";
import type { Tag } from "@entities/tag";
import { CategoryTree } from "@features/category-tree";
import { RecentPopularPosts } from "@features/recent-popular-posts";
import { TagCloud } from "@features/tag-cloud";
import { TotalViewCount } from "@features/total-view-count";

interface PublicSidebarContentProps {
  recentPosts: Post[];
  popularPosts: PopularPost[] | null;
  categories: Category[];
  tags: Tag[];
  totalViews: TotalViewsStats | null;
  onItemClick?: () => void;
}

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
  onItemClick,
}: PublicSidebarContentProps) {
  return (
    <>
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
