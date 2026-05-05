export const publicTagKeys = {
  all: () => ["public", "tags"] as const,
  list: () => [...publicTagKeys.all(), "list"] as const,
};
