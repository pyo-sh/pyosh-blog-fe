import type { MetadataRoute } from "next";
import { getSiteUrl } from "@shared/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/manage/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
