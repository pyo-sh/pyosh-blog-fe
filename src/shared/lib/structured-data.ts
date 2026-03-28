import { URLS } from "@shared/constant/url";
import {
  buildAbsoluteUrl,
  getPostDescription,
  getSiteName,
} from "@shared/lib/seo";

export { getPostDescription, getSiteUrl } from "@shared/lib/seo";

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

export function buildWebSiteJsonLd(siteUrl: string): WebSiteJsonLd {
  const normalizedSiteUrl = normalizeBaseUrl(siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: getSiteName(),
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
  post: StructuredDataPost,
  siteUrl: string,
): BlogPostingJsonLd {
  const normalizedSiteUrl = normalizeBaseUrl(siteUrl);
  const publishedAt = post.publishedAt ?? post.createdAt;
  const modifiedAt = post.contentModifiedAt ?? publishedAt;
  const keywords = post.tags.map((tag) => tag.name).filter(Boolean);
  const image = post.thumbnailUrl
    ? (buildAbsoluteUrl(post.thumbnailUrl) ?? undefined)
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
        ? {
            item:
              buildAbsoluteUrl(item.href) ?? `${normalizedSiteUrl}${item.href}`,
          }
        : {}),
    })),
  };
}

function normalizeBaseUrl(siteUrl: string) {
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}
