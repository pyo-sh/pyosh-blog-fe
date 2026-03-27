"use client";

import { useSiteViewCount } from "@shared/hooks/use-site-view-count";

export function SiteViewCounter() {
  useSiteViewCount();

  return null;
}
