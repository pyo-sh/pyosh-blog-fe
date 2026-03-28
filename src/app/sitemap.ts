import type { MetadataRoute } from "next";
import { fetchCategories } from "@entities/category";
import { fetchPublishedPostSlugs } from "@entities/post";
import { buildAbsoluteUrl } from "@shared/lib/seo";

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/guestbook", changeFrequency: "weekly", priority: 0.5 },
  { path: "/tags", changeFrequency: "weekly", priority: 0.5 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugsResponse, categories] = await Promise.all([
    fetchPublishedPostSlugs(),
    fetchCategories(),
  ]);

  const visibleCategories = categories.filter((category) => category.isVisible);

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: buildAbsoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...slugsResponse.slugs.map((post) => ({
      url: buildAbsoluteUrl(`/posts/${encodeURIComponent(post.slug)}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...visibleCategories.map((category) => ({
      url: buildAbsoluteUrl(`/categories/${encodeURIComponent(category.slug)}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
