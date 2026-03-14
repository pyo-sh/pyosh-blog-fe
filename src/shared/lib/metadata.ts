const DEFAULT_SITE_NAME = "Pyosh Blog";
const DEFAULT_DESCRIPTION =
  "프론트엔드, 개발 메모, 그리고 만드는 과정을 기록하는 Pyosh Blog입니다.";
const SUMMARY_LIMIT = 160;

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getSiteUrl() {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelSiteUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ??
    process.env.VERCEL_URL?.trim();

  if (envSiteUrl) {
    return trimTrailingSlash(envSiteUrl);
  }

  if (vercelSiteUrl) {
    return trimTrailingSlash(`https://${vercelSiteUrl}`);
  }

  return null;
}

export function getSiteName() {
  return DEFAULT_SITE_NAME;
}

export function getDefaultDescription() {
  return DEFAULT_DESCRIPTION;
}

export function getMetadataBase() {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return undefined;
  }

  return new URL(siteUrl);
}

export function toAbsoluteUrl(path: string) {
  try {
    return new URL(path);
  } catch {
    const metadataBase = getMetadataBase();

    if (!metadataBase) {
      return undefined;
    }

    return new URL(path, metadataBase);
  }
}

export function createMetadataSummary(contentMd: string) {
  const plainText = contentMd
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[>*_~]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= SUMMARY_LIMIT) {
    return plainText;
  }

  return `${plainText.slice(0, SUMMARY_LIMIT).trimEnd()}...`;
}
