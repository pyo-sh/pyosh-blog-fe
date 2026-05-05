import type { FetchAdminPostsParams, FetchPostsParams } from "./model";

type PublicPostListKeyParams = FetchPostsParams & {
  basePath?: string;
};

function normalizePublicPostListParams(params: PublicPostListKeyParams = {}) {
  return {
    page: params.page,
    limit: params.limit,
    categoryId: params.categoryId,
    tagSlug: params.tagSlug,
    q: params.q,
    filter: params.filter,
    basePath: params.basePath,
  };
}

function normalizeAdminPostListParams(params: FetchAdminPostsParams = {}) {
  return {
    page: params.page,
    limit: params.limit,
    categoryId: params.categoryId,
    tagSlug: params.tagSlug,
    q: params.q,
    status: params.status,
    visibility: params.visibility,
    sort: params.sort,
    order: params.order,
    includeDeleted: params.includeDeleted,
    deletedState: params.deletedState,
  };
}

export const publicPostKeys = {
  all: () => ["public", "posts"] as const,
  list: (params: PublicPostListKeyParams = {}) =>
    [
      ...publicPostKeys.all(),
      "list",
      normalizePublicPostListParams(params),
    ] as const,
  detail: (slug: string) => [...publicPostKeys.all(), "detail", slug] as const,
};

export const adminPostKeys = {
  all: () => ["admin", "posts"] as const,
  list: (params: FetchAdminPostsParams = {}) =>
    [
      ...adminPostKeys.all(),
      "list",
      normalizeAdminPostListParams(params),
    ] as const,
  detail: (id: number) => [...adminPostKeys.all(), "detail", id] as const,
  pinnedCount: () => [...adminPostKeys.all(), "pinned-count"] as const,
};
