import type { DashboardStats, PopularPost, TotalViewsStats } from "./model";
import { clientFetch, serverFetch } from "@shared/api";

interface PopularPostsResponse {
  data: PopularPost[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return clientFetch<DashboardStats>("/api/admin/stats/dashboard");
}

export async function fetchPopularPosts(
  days: number,
  cookieHeader?: string,
): Promise<PopularPost[]> {
  const searchParams = new URLSearchParams({
    days: String(days),
    limit: "10",
  });
  const response = await serverFetch<PopularPostsResponse>(
    `/api/stats/popular?${searchParams.toString()}`,
    {},
    cookieHeader,
  );

  return response.data;
}

export async function fetchTotalViews(
  cookieHeader?: string,
): Promise<TotalViewsStats> {
  return serverFetch<TotalViewsStats>(
    "/api/stats/total-views",
    {},
    cookieHeader,
  );
}
