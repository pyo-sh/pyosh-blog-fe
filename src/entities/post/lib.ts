import type { Post } from "./model";
import type { PaginatedResponse } from "@shared/api";
import type { QueryClient } from "@tanstack/react-query";

export const MAX_PINNED_POSTS = 5;

export function countPinnedAdminPostsFromCache(queryClient: QueryClient) {
  const cachedQueries = queryClient.getQueriesData<PaginatedResponse<Post>>({
    queryKey: ["admin-posts"],
  });

  if (cachedQueries.length === 0) {
    return null;
  }

  const pinnedIds = new Set<number>();

  for (const [, response] of cachedQueries) {
    for (const post of response?.data ?? []) {
      if (isPinnedActivePost(post)) {
        pinnedIds.add(post.id);
      }
    }
  }

  return pinnedIds.size;
}

function isPinnedActivePost(post: Post) {
  return post.deletedAt === null && post.isPinned;
}
