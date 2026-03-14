import type { Category } from "./model";
import { clientFetch, serverFetch } from "@shared/api";

export async function fetchCategories(
  cookieHeader?: string,
): Promise<Category[]> {
  return cookieHeader
    ? serverFetch<Category[]>("/api/categories", {}, cookieHeader)
    : clientFetch<Category[]>("/api/categories");
}
