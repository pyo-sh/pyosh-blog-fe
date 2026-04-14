import { ApiResponseError } from "@shared/api";
import { buildPostHref } from "@shared/lib/post-url";

export const MAX_PINNED_POSTS = 5;

export function isPinnedPostLimitError(error: unknown) {
  return error instanceof ApiResponseError && error.statusCode === 409;
}
