export type AssetDefaultCategoryKey = "thumbnail" | "default" | "uncategorized";

export interface AssetCategory {
  id: number;
  key: AssetDefaultCategoryKey | (string & {}) | null;
  name: string;
  sortOrder: number;
  isProtected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedAsset {
  id: number;
  url: string;
  displayName: string | null;
  category: AssetCategory;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export interface Asset extends UploadedAsset {
  createdAt: string;
}

export interface UploadAssetsResponse {
  assets: UploadedAsset[];
}

export interface AssetUploadMetadata {
  displayName?: string | null;
  categoryId?: number;
}

export interface AssetListParams {
  page?: number;
  limit?: number;
  categoryId?: number | null;
  q?: string;
}

export interface UpdateAssetBody {
  displayName?: string | null;
  categoryId?: number;
}
