import type { DashboardStats, PopularPost, TotalViewsStats } from "./model";
import {
  clientFetch,
  publicServerFetch,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@shared/api";

interface PopularPostsResponse {
  data: PopularPost[];
}

function buildPopularPostsPath(days: number, limit: number) {
  const searchParams = new URLSearchParams({
    days: String(days),
    limit: String(limit),
  });

  return `/stats/popular?${searchParams.toString()}`;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return clientFetch<DashboardStats>("/admin/stats/dashboard");
}

export async function fetchPopularPosts(
  days: number,
  limit = 10,
): Promise<PopularPost[]> {
  const response = await publicServerFetch<PopularPostsResponse>(
    buildPopularPostsPath(days, limit),
    { revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS.stats },
  );

  return response.data;
}

export async function fetchPopularPostsClient(
  days: number,
  limit = 10,
): Promise<PopularPost[]> {
  const response = await clientFetch<PopularPostsResponse>(
    buildPopularPostsPath(days, limit),
  );

  return response.data;
}

export async function fetchTotalViews(): Promise<TotalViewsStats> {
  return publicServerFetch<TotalViewsStats>("/stats/total-views", {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS.stats,
  });
}
