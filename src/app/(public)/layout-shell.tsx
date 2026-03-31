"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@entities/category";
import type { Post } from "@entities/post";
import type { PopularPost, TotalViewsStats } from "@entities/stat";
import type { Tag } from "@entities/tag";
import { SlideInPanel } from "@shared/ui/libs";
import { Header } from "@widgets/header";
import {
  PublicSidebarContent,
  PublicSidebarPanel,
  StickySidebarWrapper,
} from "@widgets/public-sidebar";

const LG_BREAKPOINT = 1080;

interface PublicLayoutShellProps {
  recentPosts: Post[];
  popularPosts: PopularPost[] | null;
  categories: Category[];
  tags: Tag[];
  totalViews: TotalViewsStats | null;
  children: React.ReactNode;
}

export function PublicLayoutShell({
  recentPosts,
  popularPosts,
  categories,
  tags,
  totalViews,
  children,
}: PublicLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);
  const didOpenRef = useRef(false);

  // Auto-close slide-in when viewport reaches lg breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= LG_BREAKPOINT) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Return focus to hamburger button when sidebar closes
  useEffect(() => {
    if (isSidebarOpen) {
      didOpenRef.current = true;
    } else if (didOpenRef.current) {
      hamburgerBtnRef.current?.focus();
    }
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <Header
        hamburgerRef={hamburgerBtnRef}
        onHamburgerClick={() => setIsSidebarOpen((v) => !v)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* 2-column layout: sidebar + main */}
      <div className="mx-auto flex w-full max-w-[67.5rem] gap-6 px-4 md:px-6">
        {/* Desktop sidebar */}
        <aside
          aria-label="사이드바"
          className="hidden w-[210px] shrink-0 lg:block"
        >
          <StickySidebarWrapper>
            <div className="pr-6 pt-8 pb-16">
              <PublicSidebarContent
                recentPosts={recentPosts}
                popularPosts={popularPosts}
                categories={categories}
                tags={tags}
                totalViews={totalViews}
              />
            </div>
          </StickySidebarWrapper>
        </aside>

        {/* Page content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {/* Mobile slide-in sidebar */}
      <SlideInPanel
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        id="public-sidebar-panel"
        label="사이드바 내비게이션"
        className="w-[min(320px,85vw)] border-l-0 shadow-[-4px_0_24px_rgba(0,0,0,0.1)]"
      >
        <PublicSidebarPanel
          recentPosts={recentPosts}
          popularPosts={popularPosts}
          categories={categories}
          tags={tags}
          totalViews={totalViews}
          onItemClick={closeSidebar}
          onClose={closeSidebar}
        />
      </SlideInPanel>
    </>
  );
}
