const FALLBACK_API_URL = "http://localhost:5500";
const PUBLIC_API_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL?.trim() || FALLBACK_API_URL,
);

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

export function toCanonicalAssetUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (!trimmedUrl || !PUBLIC_API_URL) {
    return trimmedUrl;
  }

  try {
    const absoluteUrl = new URL(trimmedUrl);

    if (
      absoluteUrl.origin === new URL(PUBLIC_API_URL).origin &&
      absoluteUrl.pathname.startsWith("/uploads/")
    ) {
      return `${absoluteUrl.pathname}${absoluteUrl.search}${absoluteUrl.hash}`;
    }
  } catch {
    return trimmedUrl;
  }

  return trimmedUrl;
}

function normalizeApiUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
