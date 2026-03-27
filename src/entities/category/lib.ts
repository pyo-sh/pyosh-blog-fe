import type { Category } from "./model";

export function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }

    const childCategory = findCategoryBySlug(category.children ?? [], slug);

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
