import type { Metadata } from "next";

const FALLBACK_SITE_URL = "http://localhost:3000";
const BLOG_NAME = "Pyosh Blog";
const BLOG_DESCRIPTION = "Pyosh 개발 블로그";
const DESCRIPTION_LIMIT = 160;
const DEFAULT_TEXT_LIMIT = 200;

type QueryValue = string | number | boolean | null | undefined;

interface DescriptionSource {
  summary?: string | null;
  description?: string | null;
  contentMd: string;
}

export function getSiteName() {
  return BLOG_NAME;
}

export function getSiteDescription() {
  return BLOG_DESCRIPTION;
}

export function getSiteUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredSiteUrl) {
    return FALLBACK_SITE_URL;
  }

  return configuredSiteUrl.endsWith("/")
    ? configuredSiteUrl.slice(0, -1)
    : configuredSiteUrl;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function extractPlainText(
  markdown: string,
  maxLength = DEFAULT_TEXT_LIMIT,
) {
  const plainText = markdown
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

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const ellipsis = "...";
  const safeLimit = Math.max(maxLength - ellipsis.length, 0);

  if (safeLimit === 0) {
    return ellipsis.slice(0, maxLength);
  }

  return `${plainText.slice(0, safeLimit).trimEnd()}${ellipsis}`;
}

export function getPostDescription(post: DescriptionSource) {
  return (
    post.description?.trim() ||
    post.summary?.trim() ||
    extractPlainText(post.contentMd, DESCRIPTION_LIMIT)
  );
}

export function buildCanonicalPath(
  pathname: string,
  query?: Record<string, QueryValue>,
) {
  const searchParams = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (key === "page" && Number(value) === 1) {
        continue;
      }

      if (key === "filter" && value === "title_content") {
        continue;
      }

      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function buildCanonicalMetadata(
  pathname: string,
  query?: Record<string, QueryValue>,
): Pick<Metadata, "alternates" | "openGraph"> {
  const canonical = buildCanonicalPath(pathname, query);

  return {
    alternates: {
      canonical,
    },
    openGraph: {
      url: canonical,
    },
  };
}

export function buildAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  return `${getSiteUrl()}${normalizedPath}`;
}
