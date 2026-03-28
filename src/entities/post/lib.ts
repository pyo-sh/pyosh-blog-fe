import { fetchAdminPosts } from "./api";
import type { Post } from "./model";

export const MAX_PINNED_POSTS = 5;

const PINNED_COUNT_PAGE_SIZE = 100;

export async function countPinnedAdminPosts() {
  let page = 1;
  let totalPages = 1;
  let pinnedCount = 0;

  do {
    const response = await fetchAdminPosts({
      page,
      limit: PINNED_COUNT_PAGE_SIZE,
    });

    pinnedCount += response.data.filter(isPinnedActivePost).length;
    totalPages = response.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return pinnedCount;
}

function isPinnedActivePost(post: Post) {
  return post.deletedAt === null && post.isPinned;
}
