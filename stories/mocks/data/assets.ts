import type { Asset } from "@entities/asset";

const PLACEHOLDER_SVG = (width: number, height: number, label: string) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="%23cccccc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23666666">${label}</text></svg>`;

export const mockAssets: Asset[] = [
  {
    id: 1,
    url: PLACEHOLDER_SVG(800, 600, "800×600"),
    mimeType: "image/jpeg",
    sizeBytes: 102400,
    width: 800,
    height: 600,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: 2,
    url: PLACEHOLDER_SVG(1200, 800, "1200×800"),
    mimeType: "image/png",
    sizeBytes: 204800,
    width: 1200,
    height: 800,
    createdAt: "2026-01-20T14:00:00.000Z",
  },
  {
    id: 3,
    url: PLACEHOLDER_SVG(400, 400, "400×400"),
    mimeType: "image/webp",
    sizeBytes: 51200,
    width: 400,
    height: 400,
    createdAt: "2026-02-05T08:00:00.000Z",
  },
];
