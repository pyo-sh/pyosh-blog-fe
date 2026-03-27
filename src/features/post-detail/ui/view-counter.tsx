"use client";

import { useSiteViewCount } from "@shared/hooks/use-site-view-count";
import { useViewCount } from "@shared/hooks/use-view-count";

interface ViewCounterProps {
  postId: number;
}

export function ViewCounter({ postId }: ViewCounterProps) {
  useSiteViewCount();
  useViewCount(postId);

  return null;
}
