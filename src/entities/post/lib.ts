import { ApiResponseError } from "@shared/api";

export const MAX_PINNED_POSTS = 5;

export function buildPostHref(slug: string) {
  return `/posts/${encodeURIComponent(slug)}`;
}

export function isPinnedPostLimitError(error: unknown) {
  return error instanceof ApiResponseError && error.statusCode === 409;
}
