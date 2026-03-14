"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { AdminSidebar } from "@widgets/admin-sidebar";

export function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();

  if (segment === "login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
