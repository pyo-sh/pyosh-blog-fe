"use client";

import { useEffect, useState } from "react";
import { EMPTY_EXPANDED_SLUGS } from "./tree-helpers";

export function useExpandedCategorySlugs(
  initialExpandedSlugs: string[] = EMPTY_EXPANDED_SLUGS,
) {
  const expandedStateKey = JSON.stringify(initialExpandedSlugs);
  const [expandedSlugs, setExpandedSlugs] = useState(
    () => new Set(initialExpandedSlugs),
  );

  useEffect(() => {
    setExpandedSlugs(new Set(JSON.parse(expandedStateKey) as string[]));
  }, [expandedStateKey]);

  const toggle = (categorySlug: string) => {
    setExpandedSlugs((current) => {
      const next = new Set(current);

      if (next.has(categorySlug)) {
        next.delete(categorySlug);
      } else {
        next.add(categorySlug);
      }

      return next;
    });
  };

  return {
    expandedSlugs,
    toggle,
    expandAll: (categorySlugs: string[]) =>
      setExpandedSlugs(new Set(categorySlugs)),
    collapseAll: () => setExpandedSlugs(new Set()),
  };
}
