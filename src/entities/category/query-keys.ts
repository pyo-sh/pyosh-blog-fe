export const publicCategoryKeys = {
  all: () => ["public", "categories"] as const,
  tree: () => [...publicCategoryKeys.all(), "tree"] as const,
};

export const adminCategoryKeys = {
  all: () => ["admin", "categories"] as const,
  tree: () => [...adminCategoryKeys.all(), "tree"] as const,
};
