import type {
  Category,
  CategoryTreeChange,
  CreateCategoryBody,
  DeleteCategoriesBody,
  DeleteCategoryOptions,
  UpdateCategoryBody,
  UpdateCategoryOrderBody,
  UpdateCategoryTreeBody,
} from "./model";
import {
  clientFetch,
  clientMutate,
  publicServerFetch,
  serverFetch,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@shared/api";

interface CategoriesResponse {
  categories: Category[];
}

interface CategoryResponse {
  category: Category;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await publicServerFetch<CategoriesResponse>("/categories", {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS.taxonomy,
  });

  return response.categories;
}

export async function fetchCategoriesClient(): Promise<Category[]> {
  const response = await clientFetch<CategoriesResponse>("/categories");

  return response.categories;
}

export async function fetchCategoriesAdmin(
  cookieHeader?: string,
): Promise<Category[]> {
  const response = cookieHeader
    ? await serverFetch<CategoriesResponse>(
        "/categories?include_hidden=true",
        {},
        cookieHeader,
      )
    : await clientFetch<CategoriesResponse>("/categories?include_hidden=true");

  return response.categories;
}

export async function createCategory(
  body: CreateCategoryBody,
): Promise<Category> {
  const response = await clientMutate<CategoryResponse>("/categories", {
    body: JSON.stringify(body),
  });

  return response.category;
}

export async function updateCategory(
  id: number,
  body: UpdateCategoryBody,
): Promise<Category> {
  const response = await clientMutate<CategoryResponse>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return response.category;
}

export async function updateCategoryOrder(
  body: UpdateCategoryOrderBody,
): Promise<void> {
  await clientMutate<void>("/categories/order", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function updateCategoryTree(
  changes: CategoryTreeChange[],
): Promise<void> {
  const body: UpdateCategoryTreeBody = { changes };

  await clientMutate<void>("/categories/tree", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteCategory(
  id: number,
  options: DeleteCategoryOptions,
): Promise<void> {
  const searchParams = new URLSearchParams();

  if (options.action) {
    searchParams.set("action", options.action);
  }

  if (options.moveTo !== undefined) {
    searchParams.set("moveTo", String(options.moveTo));
  }

  const query = searchParams.toString();

  await clientMutate<void>(`/categories/${id}${query ? `?${query}` : ""}`, {
    method: "DELETE",
  });
}

export async function deleteCategories(
  ids: number[],
  options: DeleteCategoryOptions,
): Promise<void> {
  const body: DeleteCategoriesBody = {
    ids,
    ...options,
  };

  await clientMutate<void>("/categories/bulk", {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}
