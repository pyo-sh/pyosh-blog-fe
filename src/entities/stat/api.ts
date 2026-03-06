import type { DashboardStats } from "./model";
import { clientFetch } from "@shared/api";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return clientFetch<DashboardStats>("/api/admin/stats/dashboard");
}
