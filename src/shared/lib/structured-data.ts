import type { Post } from "@entities/post";
import { URLS } from "@shared/constant/url";

const FALLBACK_SITE_URL = "http://localhost:3000";
const BLOG_NAME = "Pyosh Blog";
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

interface EntryPointJsonLd {
  "@type": "EntryPoint";
  urlTemplate: string;
}

interface SearchActionJsonLd {
  "@type": "SearchAction";
  target: EntryPointJsonLd;
  "query-input": string;
}

export interface WebSiteJsonLd extends StructuredDataBase {
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction: SearchActionJsonLd;
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

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getPostDescription(post: Pick<Post, "summary" | "contentMd">) {
  const plainText = (
    post.summary?.trim() || stripMarkdown(post.contentMd)
  ).trim();

  if (plainText.length <= DESCRIPTION_LIMIT) {
    return plainText;
  }

  return `${plainText.slice(0, DESCRIPTION_LIMIT).trimEnd()}...`;
}

export function buildWebSiteJsonLd(siteUrl: string): WebSiteJsonLd {
  const normalizedSiteUrl = normalizeBaseUrl(siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BLOG_NAME,
    url: `${normalizedSiteUrl}/`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${normalizedSiteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBlogPostingJsonLd(
  post: Pick<
    Post,
    | "title"
    | "slug"
    | "summary"
    | "contentMd"
    | "publishedAt"
    | "createdAt"
    | "contentModifiedAt"
    | "thumbnailUrl"
    | "tags"
    | "category"
  >,
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
