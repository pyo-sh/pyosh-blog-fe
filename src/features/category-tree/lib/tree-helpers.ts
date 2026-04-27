import type { Category } from "@entities/category";

export const EMPTY_EXPANDED_SLUGS: string[] = [];

export function getVisibleCategoryItems(categories: Category[]): Category[] {
  return categories.filter((category) => category.isVisible);
}

export function getVisibleChildren(category: Category): Category[] {
  return (category.children ?? []).filter((child) => child.isVisible);
}

export function collectExpandableSlugs(categories: Category[]): string[] {
  return categories.flatMap((category) => {
    const children = getVisibleChildren(category);

    if (children.length === 0) {
      return [];
    }

    return [category.slug, ...collectExpandableSlugs(children)];
  });
}
