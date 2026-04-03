"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import hamburgerMenuLinear from "@iconify-icons/solar/hamburger-menu-linear";
import { usePathname } from "next/navigation";
import {
  ADMIN_CHROME_HEIGHT,
  ADMIN_CHROME_HEIGHT_CLASS,
  ADMIN_CHROME_STYLE,
} from "./ui/admin-shell-constants";
import { cn } from "@shared/lib/style-utils";
import { AdminHeaderActions, AdminSidebar } from "@widgets/admin-sidebar";

const PAGE_TITLES = [
  { match: (pathname: string) => pathname === "/manage", title: "대시보드" },
  {
    match: (pathname: string) => pathname === "/manage/posts/new",
    title: "글 작성",
  },
  {
    match: (pathname: string) => pathname.endsWith("/edit"),
    title: "글 수정",
  },
  {
    match: (pathname: string) => pathname.endsWith("/preview"),
    title: "글 미리보기",
  },
  {
    match: (pathname: string) => pathname.startsWith("/manage/posts"),
    title: "글",
  },
  {
    match: (pathname: string) => pathname.startsWith("/manage/categories"),
    title: "카테고리",
  },
  {
    match: (pathname: string) => pathname.startsWith("/manage/comments"),
    title: "댓글",
  },
  {
    match: (pathname: string) => pathname.startsWith("/manage/guestbook"),
    title: "방명록",
  },
  {
    match: (pathname: string) => pathname.startsWith("/manage/assets"),
    title: "에셋",
  },
] as const;

function getPageTitle(pathname: string) {
  return PAGE_TITLES.find((entry) => entry.match(pathname))?.title ?? "관리자";
}

export function ManageLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const didOpenRef = useRef(false);

  useEffect(() => {
    if (sidebarOpen) {
      didOpenRef.current = true;
    } else if (didOpenRef.current) {
      hamburgerRef.current?.focus();
    }
  }, [sidebarOpen]);

  if (pathname === "/manage/login") {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-background-1 text-text-1">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />

      <div
        className={cn(
          "relative z-10 min-h-screen transition-[padding] duration-300",
          sidebarCollapsed ? "md:pl-16" : "md:pl-60",
        )}
        style={
          {
            "--admin-sidebar-offset": sidebarCollapsed ? "4rem" : "15rem",
          } as React.CSSProperties
        }
      >
        <header
          className={cn(
            "sticky top-0 z-10 box-border flex items-center gap-4 border-b border-border-4 bg-[rgba(249,249,250,0.8)] px-4 backdrop-blur-[16px] backdrop-saturate-[1.4] dark:bg-[rgba(19,20,21,0.85)] md:px-6",
            ADMIN_CHROME_HEIGHT_CLASS,
          )}
          style={ADMIN_CHROME_STYLE}
        >
          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={sidebarOpen}
            aria-controls={sidebarOpen ? "admin-nav-overlay" : undefined}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-2 transition-colors hover:bg-background-3 hover:text-text-1 md:hidden"
          >
            <Icon icon={hamburgerMenuLinear} width="22" aria-hidden="true" />
          </button>

          <p className="text-lg font-bold text-text-1">
            {getPageTitle(pathname)}
          </p>

          <AdminHeaderActions />
        </header>

        <main
          className="px-4 py-6 md:px-6"
          style={{ minHeight: `calc(100dvh - ${ADMIN_CHROME_HEIGHT})` }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
