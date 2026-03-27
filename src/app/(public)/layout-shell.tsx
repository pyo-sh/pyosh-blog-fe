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
        <aside aria-label="사이드바" className="hidden w-56 shrink-0 lg:block">
          <StickySidebarWrapper>
            <div className="rounded-2xl border border-border-3 bg-background-1">
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
      >
        <div className="flex items-center justify-between border-b border-border-3 px-4 py-3">
          <span className="text-body-sm font-medium text-text-1">메뉴</span>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="메뉴 닫기"
            className="rounded-md p-2 text-text-3 transition-colors hover:bg-background-2 hover:text-text-1"
          >
            <CloseIcon />
          </button>
        </div>
        <PublicSidebarContent
          recentPosts={recentPosts}
          popularPosts={popularPosts}
          categories={categories}
          tags={tags}
          totalViews={totalViews}
          onItemClick={closeSidebar}
        />
      </SlideInPanel>
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
