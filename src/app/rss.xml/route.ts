import { fetchPosts } from "@entities/post";
import {
  buildAbsoluteUrl,
  getSiteDescription,
  getSiteName,
  getSiteUrl,
} from "@shared/lib/seo";

const RSS_POST_LIMIT = 20;
export async function GET() {
  const response = await fetchPosts({ limit: RSS_POST_LIMIT });
  const xml = buildRssXml(response.data);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function buildRssXml(posts: Awaited<ReturnType<typeof fetchPosts>>["data"]) {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  const siteDescription = getSiteDescription();
  const now = new Date().toUTCString();
  const items = posts
    .map((post) => {
      const link = buildAbsoluteUrl(`/posts/${encodeURIComponent(post.slug)}`);
      const pubDate = new Date(
        post.publishedAt ?? post.createdAt,
      ).toUTCString();
      const categories = post.tags
        .map((tag) => `<category>${escapeXml(tag.name)}</category>`)
        .join("");
      const description = escapeXml(
        post.description?.trim() || post.summary?.trim() || post.title,
      );

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(link)}</link>`,
        `<guid>${escapeXml(link)}</guid>`,
        `<pubDate>${pubDate}</pubDate>`,
        `<description>${description}</description>`,
        categories,
        "</item>",
      ].join("");
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>${escapeXml(siteName)}</title>`,
    `<link>${escapeXml(siteUrl)}</link>`,
    `<description>${escapeXml(siteDescription)}</description>`,
    `<language>ko-kr</language>`,
    `<lastBuildDate>${now}</lastBuildDate>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
