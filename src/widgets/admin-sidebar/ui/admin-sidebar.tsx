"use client";

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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 border-r border-border-3 bg-background-2">
      <div className="px-5 py-6">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-text-1 hover:text-primary-1 transition-colors"
        >
          Admin
        </Link>
      </div>

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
    </aside>
  );
}
