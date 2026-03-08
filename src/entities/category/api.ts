import type { Category } from "./model";
import { serverFetch } from "@shared/api";

export async function fetchCategories(
  cookieHeader?: string,
): Promise<Category[]> {
  return serverFetch<Category[]>("/api/categories", {}, cookieHeader);
}
