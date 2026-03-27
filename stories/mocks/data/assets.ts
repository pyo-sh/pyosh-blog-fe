import type { Asset } from "@entities/asset";

export const mockAssets: Asset[] = [
  {
    id: 1,
    url: "https://via.placeholder.com/800x600",
    mimeType: "image/jpeg",
    sizeBytes: 102400,
    width: 800,
    height: 600,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: 2,
    url: "https://via.placeholder.com/1200x800",
    mimeType: "image/png",
    sizeBytes: 204800,
    width: 1200,
    height: 800,
    createdAt: "2026-01-20T14:00:00.000Z",
  },
  {
    id: 3,
    url: "https://via.placeholder.com/400x400",
    mimeType: "image/webp",
    sizeBytes: 51200,
    width: 400,
    height: 400,
    createdAt: "2026-02-05T08:00:00.000Z",
  },
];
