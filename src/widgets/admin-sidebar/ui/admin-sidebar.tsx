"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout } from "@entities/auth";
import { cn } from "@shared/lib/style-utils";

const MENU_ITEMS = [
  { label: "대시보드", path: "/manage" },
  { label: "글 관리", path: "/manage/posts" },
  { label: "카테고리", path: "/manage/categories" },
  { label: "댓글", path: "/manage/comments" },
  { label: "방명록", path: "/manage/guestbook" },
  { label: "에셋", path: "/manage/assets" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
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
    <aside className="w-60 shrink-0 h-screen sticky top-0 border-r border-border-3 bg-background-2 flex flex-col">
      <div className="px-5 py-6 flex items-center justify-between">
        <Link
          href="/manage"
          className="text-lg font-semibold text-text-1 hover:text-primary-1 transition-colors"
        >
          Admin
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isPending}
          className="text-sm text-text-3 hover:text-text-1 transition-colors disabled:opacity-50"
        >
          로그아웃
        </button>
      </div>

      <nav>
        <ul className="flex flex-col gap-1 px-3">
          {MENU_ITEMS.map((item) => {
            const isActive =
              item.path === "/manage"
                ? pathname === "/manage"
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
