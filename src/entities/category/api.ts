import type { Category } from "./model";
import { clientFetch, serverFetch } from "@shared/api";

export async function fetchCategories(
  cookieHeader?: string,
): Promise<Category[]> {
  return serverFetch<Category[]>("/api/categories", {}, cookieHeader);
}

export async function fetchCategoriesClient(): Promise<Category[]> {
  return clientFetch<Category[]>("/api/categories");
}
