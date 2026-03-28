import { ApiResponseError } from "@shared/api";

export const MAX_PINNED_POSTS = 5;

export function isPinnedPostLimitError(error: unknown) {
  return error instanceof ApiResponseError && error.statusCode === 409;
}
