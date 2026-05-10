import type { Asset, AssetCategory, AssetDefaultCategoryKey } from "./model";
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

export function buildAssetMarkdown(
  asset: Pick<Asset, "url"> & Partial<Pick<Asset, "displayName">>,
): string {
  const canonicalUrl = toCanonicalAssetUrl(asset.url);

  return `![${getAssetDisplayName({
    url: canonicalUrl,
    displayName: asset.displayName ?? null,
  })}](${canonicalUrl})`;
}

export function getAssetDisplayName(
  asset: Pick<Asset, "displayName" | "url">,
): string {
  return asset.displayName?.trim() || getAssetFilename(asset.url);
}

export function findAssetCategoryByKey(
  categories: AssetCategory[],
  key: AssetDefaultCategoryKey,
): AssetCategory | null {
  return categories.find((category) => category.key === key) ?? null;
}

export function getAssetCategoryTone(category: AssetCategory): string {
  if (category.key === "thumbnail") {
    return "border-primary-1/20 bg-primary-1/10 text-primary-1";
  }

  if (category.key === "default") {
    return "border-positive-1/20 bg-positive-1/10 text-positive-1";
  }

  if (category.key === "uncategorized") {
    return "border-border-3 bg-background-3 text-text-3";
  }

  return "border-info-1/20 bg-info-1/10 text-info-1";
}

export function getInitialAssetDisplayName(filename: string): string {
  const withoutExtension = filename.replace(/\.[^./\\]+$/, "").trim();

  return withoutExtension || filename;
}
