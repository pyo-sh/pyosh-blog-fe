"use client";

import { useViewCount } from "@shared/hooks/use-view-count";

interface ViewCounterProps {
  postId: number;
}

export function ViewCounter({ postId }: ViewCounterProps) {
  useViewCount(postId);

  return null;
}
