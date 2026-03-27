"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@shared/lib/style-utils";

const MENU_ITEMS = [
  { label: "대시보드", path: "/dashboard" },
  { label: "글 관리", path: "/dashboard/posts" },
  { label: "카테고리", path: "/dashboard/categories" },
  { label: "댓글", path: "/dashboard/comments" },
  { label: "방명록", path: "/dashboard/guestbook" },
  { label: "에셋", path: "/dashboard/assets" },
] as const;

// 768px = Tailwind md breakpoint (matching theme.css default)
const MD_BREAKPOINT = 768;

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SidebarNavProps {
  onItemClick?: () => void;
}

function SidebarNav({ onItemClick }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav>
      <ul className="flex flex-col gap-1 px-3">
        {MENU_ITEMS.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.path);

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={onItemClick}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary-1/10 text-primary-1 font-medium"
                    : "text-text-3 hover:bg-background-3 hover:text-text-1",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const overlayRef = useRef<HTMLElement>(null);

  // Close overlay when viewport becomes md or larger
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

  // Close overlay on back navigation
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => onClose?.();

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, onClose]);

  // Close overlay on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when overlay is open
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

  // Focus trap: confine Tab/Shift+Tab within overlay, focus first element on open
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

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (
        e.shiftKey
          ? document.activeElement === first
          : document.activeElement === last
      ) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
      }
    };

    document.addEventListener("keydown", trap);

    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border-3 bg-background-2">
        <div className="px-5 py-6">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-text-1 hover:text-primary-1 transition-colors"
          >
            Admin
          </Link>
        </div>
        <SidebarNav />
      </aside>

      {/* Mobile: overlay */}
      {isOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Overlay sidebar */}
          <aside
            ref={overlayRef}
            className="fixed inset-y-0 left-0 z-50 w-full bg-background-2"
            aria-modal="true"
            aria-label="내비게이션 메뉴"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-3">
              <Link
                href="/dashboard"
                className="text-lg font-semibold text-text-1 hover:text-primary-1 transition-colors"
                onClick={onClose}
              >
                Admin
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="메뉴 닫기"
                className="p-2 rounded-md text-text-3 hover:bg-background-3 hover:text-text-1 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
            <SidebarNav onItemClick={onClose} />
          </aside>
        </div>
      )}
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
