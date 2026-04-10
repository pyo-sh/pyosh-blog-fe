const FALLBACK_API_URL = "http://localhost:5500";
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || FALLBACK_API_URL;

export function normalizeAssetUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return trimmedUrl;
  }

  if (!trimmedUrl.startsWith("/uploads/")) {
    return trimmedUrl;
  }

  return `${PUBLIC_API_URL}${trimmedUrl}`;
}

export function normalizeOptionalAssetUrl(url: string | null): string | null {
  if (!url) {
    return url;
  }

  return normalizeAssetUrl(url);
}
