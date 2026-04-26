import type { Category } from "@entities/category";

export function countVisibleCategoryNodes(categories: Category[]): number {
  return categories.reduce((count, category) => {
    if (!category.isVisible) {
      return count;
    }

    return count + 1 + countVisibleCategoryNodes(category.children ?? []);
  }, 0);
}

export function countVisibleCategories(categories: Category[]): number {
  return categories.reduce((sum, category) => {
    if (!category.isVisible) {
      return sum;
    }

    return (
      sum +
      (category.publishedPostCount ?? 0) +
      countVisibleCategories(category.children ?? [])
    );
  }, 0);
}
