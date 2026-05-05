export interface AdminAssetListKeyParams {
  page?: number;
  limit?: number;
}

function normalizeAdminAssetListParams(params: AdminAssetListKeyParams = {}) {
  return {
    page: params.page,
    limit: params.limit,
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
};
