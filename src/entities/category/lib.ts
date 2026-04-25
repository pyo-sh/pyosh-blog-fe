import type { Category } from "./model";
import { normalizeRouteSlug, normalizeSlug } from "@shared/lib/slug";

export function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  const normalizedSlug = normalizeRouteSlug(slug);

  return findCategoryByNormalizedSlug(categories, normalizedSlug);
}

function findCategoryByNormalizedSlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  for (const category of categories) {
    if (normalizeSlug(category.slug) === slug) {
      return category;
    }

    const childCategory = findCategoryByNormalizedSlug(
      category.children ?? [],
      slug,
    );

    if (childCategory) {
      return childCategory;
    }
  }

  return undefined;
}

export function getCategoryAncestors(
  categories: Category[],
  targetId: number,
): Category[] {
  return findCategoryPath(categories, targetId)?.slice(0, -1) ?? [];
}

function findCategoryPath(
  categories: Category[],
  targetId: number,
): Category[] | undefined {
  for (const category of categories) {
    if (category.id === targetId) {
      return [category];
    }

    const childPath = findCategoryPath(category.children ?? [], targetId);

    if (childPath) {
      return [category, ...childPath];
    }
  }

  return undefined;
}
