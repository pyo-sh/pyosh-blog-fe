import type {
  Category,
  CreateCategoryBody,
  UpdateCategoryBody,
  UpdateCategoryOrderBody,
} from "./model";
import { clientFetch, clientMutate, serverFetch } from "@shared/api";

interface CategoriesResponse {
  categories: Category[];
}

interface CategoryResponse {
  category: Category;
}

export async function fetchCategories(
  cookieHeader?: string,
): Promise<Category[]> {
  const response = await serverFetch<CategoriesResponse>(
    "/api/categories",
    {},
    cookieHeader,
  );

  return response.categories;
}

export async function fetchCategoriesClient(): Promise<Category[]> {
  const response = await clientFetch<CategoriesResponse>("/api/categories");

  return response.categories;
}

export async function fetchCategoriesAdmin(): Promise<Category[]> {
  const response = await clientFetch<CategoriesResponse>(
    "/api/categories?include_hidden=true",
  );

  return response.categories;
}

export async function createCategory(
  body: CreateCategoryBody,
): Promise<Category> {
  const response = await clientMutate<CategoryResponse>("/api/categories", {
    body: JSON.stringify(body),
  });

  return response.category;
}

export async function updateCategory(
  id: number,
  body: UpdateCategoryBody,
): Promise<Category> {
  const response = await clientMutate<CategoryResponse>(
    `/api/categories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );

  return response.category;
}

export async function updateCategoryOrder(
  body: UpdateCategoryOrderBody,
): Promise<void> {
  await clientMutate<void>("/api/categories/order", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await clientMutate<void>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}
