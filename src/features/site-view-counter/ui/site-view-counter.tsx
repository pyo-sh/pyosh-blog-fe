"use client";

import { usePathname } from "next/navigation";
import { useSiteViewCount } from "@shared/hooks/use-site-view-count";

export function SiteViewCounter() {
  const pathname = usePathname();
  const isPostDetailPage = pathname.startsWith("/posts/");

  useSiteViewCount(!isPostDetailPage);

  return null;
}
