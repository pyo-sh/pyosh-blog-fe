export interface UploadedAsset {
  id: number;
  url: string;
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
