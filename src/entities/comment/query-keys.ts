import type { FetchAdminCommentsParams } from "./api";

export interface PublicCommentListKeyParams {
  page?: number;
  limit?: number;
}

function normalizePublicCommentListParams(
  params: PublicCommentListKeyParams = {},
) {
  return {
    page: params.page,
    limit: params.limit,
  };
}

function normalizeAdminCommentListParams(
  params: FetchAdminCommentsParams = {},
) {
  return {
    page: params.page,
    limit: params.limit,
    postId: params.postId,
    status: params.status,
    authorType: params.authorType,
    startDate: params.startDate,
    endDate: params.endDate,
  };
}

export const publicCommentKeys = {
  all: () => ["public", "comments"] as const,
  list: (postId: number, params: PublicCommentListKeyParams = {}) =>
    [
      ...publicCommentKeys.all(),
      "list",
      postId,
      normalizePublicCommentListParams(params),
    ] as const,
};

export const adminCommentKeys = {
  all: () => ["admin", "comments"] as const,
  list: (params: FetchAdminCommentsParams = {}) =>
    [
      ...adminCommentKeys.all(),
      "list",
      normalizeAdminCommentListParams(params),
    ] as const,
  thread: (id: number) => [...adminCommentKeys.all(), "thread", id] as const,
  recentDashboard: () =>
    [...adminCommentKeys.all(), "recent-dashboard"] as const,
};
