import type { Asset } from "./model";
import { toCanonicalAssetUrl } from "@shared/lib/asset-url";

const assetDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getAssetFilename(url: string): string {
  const pathname = url.split("?")[0] ?? url;
  const parts = pathname.split("/");
  const segment = parts[parts.length - 1] || "asset";

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function formatAssetFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

export function formatAssetResolution(width?: number, height?: number): string {
  if (!width || !height) {
    return "해상도 정보 없음";
  }

  return `${width}×${height}`;
}

export function formatAssetDate(createdAt: string): string {
  return assetDateFormatter.format(new Date(createdAt));
}

export function buildAssetMarkdown(asset: Pick<Asset, "url">): string {
  const canonicalUrl = toCanonicalAssetUrl(asset.url);

  return `![${getAssetFilename(canonicalUrl)}](${canonicalUrl})`;
}
