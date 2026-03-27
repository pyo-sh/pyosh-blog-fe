"use client";

import { useState } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { AdminSidebar } from "@widgets/admin-sidebar";

export function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (segment === "login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar with hamburger */}
        <div className="flex h-14 items-center border-b border-border-3 bg-background-1 px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={sidebarOpen}
            className="p-2 rounded-md text-text-3 hover:bg-background-2 hover:text-text-1 transition-colors"
          >
            <HamburgerIcon />
          </button>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function HamburgerIcon() {
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
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
