import type { DashboardStats, PopularPost, TotalViewsStats } from "./model";
import { clientFetch, serverFetch } from "@shared/api";

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
  cookieHeader?: string,
  limit = 10,
): Promise<PopularPost[]> {
  const response = await serverFetch<PopularPostsResponse>(
    buildPopularPostsPath(days, limit),
    {},
    cookieHeader,
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

export async function fetchTotalViews(
  cookieHeader?: string,
): Promise<TotalViewsStats> {
  return serverFetch<TotalViewsStats>("/stats/total-views", {}, cookieHeader);
}
