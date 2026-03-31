"use client";

import { useEffect, useRef, useTransition } from "react";
import { Icon } from "@iconify/react";
import arrowLeftLinear from "@iconify-icons/solar/arrow-left-linear";
import chart2Linear from "@iconify-icons/solar/chart-2-linear";
import chatRoundDotsLinear from "@iconify-icons/solar/chat-round-dots-linear";
import documentTextLinear from "@iconify-icons/solar/document-text-linear";
import folderOpenLinear from "@iconify-icons/solar/folder-open-linear";
import galleryWideLinear from "@iconify-icons/solar/gallery-wide-linear";
import hamburgerMenuLinear from "@iconify-icons/solar/hamburger-menu-linear";
import logout2Linear from "@iconify-icons/solar/logout-2-linear";
import notebookLinear from "@iconify-icons/solar/notebook-linear";
import penNewRoundLinear from "@iconify-icons/solar/pen-new-round-linear";
import sidebarMinimalisticLinear from "@iconify-icons/solar/sidebar-minimalistic-linear";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ADMIN_CHROME_HEIGHT_CLASS } from "@app/manage/ui/admin-shell-constants";
import { logout } from "@entities/auth";
import { cn } from "@shared/lib/style-utils";
import { ThemeButton } from "@widgets/header/theme-button";
import { LogoIcon } from "@widgets/logo/ui/logo-icon";

const MENU_ITEMS = [
  {
    label: "대시보드",
    path: "/manage",
    icon: chart2Linear,
    isActive: (pathname: string) => pathname === "/manage",
  },
  {
    label: "글",
    path: "/manage/posts",
    icon: documentTextLinear,
    isActive: (pathname: string) =>
      pathname === "/manage/posts" ||
      (pathname.startsWith("/manage/posts/") && !pathname.endsWith("/new")),
  },
  {
    label: "글 작성",
    path: "/manage/posts/new",
    icon: penNewRoundLinear,
    isActive: (pathname: string) => pathname === "/manage/posts/new",
  },
  {
    label: "카테고리",
    path: "/manage/categories",
    icon: folderOpenLinear,
    isActive: (pathname: string) => pathname.startsWith("/manage/categories"),
  },
  {
    label: "댓글",
    path: "/manage/comments",
    icon: chatRoundDotsLinear,
    isActive: (pathname: string) => pathname.startsWith("/manage/comments"),
  },
  {
    label: "방명록",
    path: "/manage/guestbook",
    icon: notebookLinear,
    isActive: (pathname: string) => pathname.startsWith("/manage/guestbook"),
  },
  {
    label: "에셋",
    path: "/manage/assets",
    icon: galleryWideLinear,
    isActive: (pathname: string) => pathname.startsWith("/manage/assets"),
  },
] as const;

const MD_BREAKPOINT = 768;
const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface AdminSidebarProps {
  isCollapsed: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onToggleCollapsed: () => void;
}

interface SidebarNavProps {
  collapsed?: boolean;
  onItemClick?: () => void;
}

function AdminLogoutButton({
  iconOnly = false,
  className,
}: {
  iconOnly?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    try {
      await logout();
      startTransition(() => {
        router.push("/manage/login");
        router.refresh();
      });
    } catch {
      toast.error("로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={isPending}
      aria-label="로그아웃"
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3 hover:text-text-1 disabled:opacity-50",
        iconOnly ? "h-9 w-9" : "gap-2 px-3 py-2 text-sm font-medium",
        className,
      )}
    >
      <Icon icon={logout2Linear} width="18" aria-hidden="true" />
      {iconOnly ? null : <span>로그아웃</span>}
    </button>
  );
}

function SidebarNav({ collapsed = false, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4" aria-label="관리자 메뉴">
      <ul className="flex flex-col gap-1">
        {MENU_ITEMS.map((item) => {
          const isActive = item.isActive(pathname);

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
                  collapsed ? "justify-center px-0" : "",
                  isActive
                    ? "bg-primary-1/10 font-medium text-primary-1"
                    : "text-text-2 hover:bg-background-3 hover:text-text-1",
                )}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  icon={item.icon}
                  width="20"
                  aria-hidden="true"
                  className="shrink-0"
                />
                <span
                  className={cn(
                    "truncate transition-[opacity,width] duration-200",
                    collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminHeaderActions() {
  return (
    <div className="ml-auto flex items-center gap-1">
      <span className="hidden text-sm text-text-3 sm:inline">관리자</span>
      <ThemeButton />
      <AdminLogoutButton iconOnly />
    </div>
  );
}

export function AdminSidebar({
  isCollapsed,
  isOpen = false,
  onClose,
  onToggleCollapsed,
}: AdminSidebarProps) {
  const overlayRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= MD_BREAKPOINT) {
        onClose?.();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => onClose?.();
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const sidebar = overlayRef.current;

    if (!sidebar) return;

    const nodes = Array.from(
      sidebar.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    first?.focus();

    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (
        event.shiftKey
          ? document.activeElement === first
          : document.activeElement === last
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    };

    document.addEventListener("keydown", trap);

    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border-3 bg-background-2 md:flex md:flex-col",
          isCollapsed ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b border-border-4 px-4",
            ADMIN_CHROME_HEIGHT_CLASS,
          )}
        >
          <Link
            href="/manage"
            className={cn(
              "flex min-w-0 items-center gap-2 text-primary-1",
              isCollapsed ? "justify-center" : "",
            )}
            title="대시보드"
          >
            {isCollapsed ? null : (
              <LogoIcon
                width={28}
                height={28}
                className="shrink-0 text-primary-1"
              />
            )}
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-xs font-medium transition-[opacity,width] duration-200",
                isCollapsed
                  ? "w-0 overflow-hidden bg-transparent p-0 opacity-0"
                  : "bg-primary-1/10 opacity-100",
              )}
            >
              Admin
            </span>
          </Link>

          <button
            type="button"
            onClick={onToggleCollapsed}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3 hover:text-text-1"
            aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            <Icon
              icon={sidebarMinimalisticLinear}
              width="18"
              aria-hidden="true"
            />
          </button>
        </div>

        <SidebarNav collapsed={isCollapsed} />

        <div className="mt-auto px-3 pb-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-3 transition-colors hover:bg-background-3 hover:text-text-1",
              isCollapsed ? "justify-center px-0" : "",
            )}
            title="블로그로 돌아가기"
          >
            <Icon icon={arrowLeftLinear} width="16" aria-hidden="true" />
            <span
              className={cn(
                "truncate transition-[opacity,width] duration-200",
                isCollapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100",
              )}
            >
              블로그로 돌아가기
            </span>
          </Link>
        </div>
      </aside>

      {isOpen ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          <aside
            id="admin-nav-overlay"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="내비게이션 메뉴"
            className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border-3 bg-background-2"
          >
            <div
              className={cn(
                "flex items-center gap-2 border-b border-border-4 px-4",
                ADMIN_CHROME_HEIGHT_CLASS,
              )}
            >
              <Link
                href="/manage"
                onClick={onClose}
                className="flex items-center gap-2 text-primary-1"
              >
                <LogoIcon width={28} height={28} className="text-primary-1" />
                <span className="rounded bg-primary-1/10 px-1.5 py-0.5 text-xs font-medium">
                  Admin
                </span>
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3 hover:text-text-1"
                aria-label="메뉴 닫기"
              >
                <Icon
                  icon={hamburgerMenuLinear}
                  width="18"
                  aria-hidden="true"
                />
              </button>
            </div>

            <SidebarNav onItemClick={onClose} />

            <div className="mt-auto px-3 pb-4">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-3 transition-colors hover:bg-background-3 hover:text-text-1"
              >
                <Icon icon={arrowLeftLinear} width="16" aria-hidden="true" />
                <span>블로그로 돌아가기</span>
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
