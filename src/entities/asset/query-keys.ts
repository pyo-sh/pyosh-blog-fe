export interface AdminAssetListKeyParams {
  page?: number;
  limit?: number;
  categoryId?: number | null;
  q?: string;
}

function normalizeAdminAssetListParams(params: AdminAssetListKeyParams = {}) {
  return {
    page: params.page,
    limit: params.limit,
    categoryId: params.categoryId ?? null,
    q: params.q?.trim() || undefined,
  };
}

export const adminAssetKeys = {
  all: () => ["admin", "assets"] as const,
  list: (params: AdminAssetListKeyParams = {}) =>
    [
      ...adminAssetKeys.all(),
      "list",
      normalizeAdminAssetListParams(params),
    ] as const,
  categories: () => [...adminAssetKeys.all(), "categories"] as const,
};
