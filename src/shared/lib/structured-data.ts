import { URLS } from "@shared/constant/url";

const FALLBACK_SITE_URL = "http://localhost:3000";
const DESCRIPTION_LIMIT = 160;

interface StructuredDataBase {
  "@context": "https://schema.org";
  "@type": string;
}

interface PersonJsonLd {
  "@type": "Person";
  name: string;
  url: string;
}

export interface BlogPostingJsonLd extends StructuredDataBase {
  "@type": "BlogPosting";
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: PersonJsonLd;
  url: string;
  image?: string;
  keywords?: string[];
  articleSection?: string;
}

interface ListItemJsonLd {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
}

export interface BreadcrumbJsonLd extends StructuredDataBase {
  "@type": "BreadcrumbList";
  itemListElement: ListItemJsonLd[];
}

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface StructuredDataTag {
  name: string;
}

interface StructuredDataCategory {
  name: string;
}

interface StructuredDataPost {
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  contentMd: string;
  publishedAt: string | null;
  createdAt: string;
  contentModifiedAt: string | null;
  thumbnailUrl: string | null;
  tags: StructuredDataTag[];
  category: StructuredDataCategory;
}

export function getSiteUrl(): string | null {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredSiteUrl) {
    return process.env.NODE_ENV === "development" ? FALLBACK_SITE_URL : null;
  }

  return configuredSiteUrl.endsWith("/")
    ? configuredSiteUrl.slice(0, -1)
    : configuredSiteUrl;
}

export function buildBlogPostingJsonLd(
  post: StructuredDataPost,
  siteUrl: string,
): BlogPostingJsonLd {
  const normalizedSiteUrl = normalizeBaseUrl(siteUrl);
  const publishedAt = post.publishedAt ?? post.createdAt;
  const modifiedAt = post.contentModifiedAt ?? publishedAt;
  const keywords = post.tags.map((tag) => tag.name).filter(Boolean);
  const image = post.thumbnailUrl
    ? buildAbsoluteUrl(post.thumbnailUrl, normalizedSiteUrl)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: getPostDescription(post),
    datePublished: publishedAt,
    dateModified: modifiedAt,
    author: {
      "@type": "Person",
      name: "Pyosh",
      url: URLS.github,
    },
    ...(image ? { image } : {}),
    url: `${normalizedSiteUrl}/posts/${post.slug}`,
    ...(keywords.length > 0 ? { keywords } : {}),
    ...(post.category.name ? { articleSection: post.category.name } : {}),
  };
}

export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[],
  siteUrl: string,
): BreadcrumbJsonLd {
  const normalizedSiteUrl = normalizeBaseUrl(siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href
        ? { item: buildAbsoluteUrl(item.href, normalizedSiteUrl) }
        : {}),
    })),
  };
}

function getPostDescription(
  post: Pick<StructuredDataPost, "summary" | "description" | "contentMd">,
) {
  const plainText = (
    post.description?.trim() ||
    post.summary?.trim() ||
    stripMarkdown(post.contentMd)
  ).trim();

  if (plainText.length <= DESCRIPTION_LIMIT) {
    return plainText;
  }

  return `${plainText.slice(0, DESCRIPTION_LIMIT).trimEnd()}...`;
}

function normalizeBaseUrl(siteUrl: string) {
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

function buildAbsoluteUrl(pathOrUrl: string, siteUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  return `${siteUrl}${normalizedPath}`;
}

function stripMarkdown(contentMd: string) {
  return contentMd
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
}
