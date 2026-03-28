import type {
  BulkPostAction,
  CreatePostBody,
  FetchAdminPostsParams,
  FetchPostsParams,
  Post,
  PostDetailResponse,
  PostDetailWithNavigationResponse,
  PublishedPostSlugsResponse,
  UpdatePostBody,
} from "./model";
import type { PaginatedResponse } from "@shared/api";
import { clientFetch, clientMutate, serverFetch } from "@shared/api";

function buildPostSearchParams(params: FetchPostsParams): string {
  return buildSearchParams(params);
}

function buildAdminPostSearchParams(params: FetchAdminPostsParams): string {
  return buildSearchParams(params);
}

function buildSearchParams(
  params: FetchPostsParams | FetchAdminPostsParams,
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.categoryId !== undefined) {
    searchParams.set("categoryId", String(params.categoryId));
  }

  if (params.tagSlug !== undefined) {
    searchParams.set("tagSlug", params.tagSlug);
  }

  if (params.q !== undefined) {
    searchParams.set("q", params.q);
  }

  if ("filter" in params && params.filter !== undefined) {
    searchParams.set("filter", params.filter);
  }

  if ("status" in params && params.status !== undefined) {
    searchParams.set("status", params.status);
  }

  if ("visibility" in params && params.visibility !== undefined) {
    searchParams.set("visibility", params.visibility);
  }

  if ("sort" in params && params.sort !== undefined) {
    searchParams.set("sort", params.sort);
  }

  if ("order" in params && params.order !== undefined) {
    searchParams.set("order", params.order);
  }

  if ("includeDeleted" in params && params.includeDeleted !== undefined) {
    searchParams.set("includeDeleted", String(params.includeDeleted));
  }

  return searchParams.toString();
}

export async function fetchPosts(
  params: FetchPostsParams = {},
  cookieHeader?: string,
): Promise<PaginatedResponse<Post>> {
  const queryString = buildPostSearchParams(params);
  const path = queryString ? `/api/posts?${queryString}` : "/api/posts";

  return serverFetch<PaginatedResponse<Post>>(path, {}, cookieHeader);
}

export async function fetchPostBySlug(
  slug: string,
  cookieHeader?: string,
): Promise<PostDetailWithNavigationResponse> {
  return serverFetch<PostDetailWithNavigationResponse>(
    `/api/posts/${encodeURIComponent(slug)}`,
    {},
    cookieHeader,
  );
}

export async function fetchPublishedPostSlugs(
  cookieHeader?: string,
): Promise<PublishedPostSlugsResponse> {
  return serverFetch<PublishedPostSlugsResponse>(
    "/api/posts/slugs",
    {},
    cookieHeader,
  );
}

export async function fetchAdminPost(
  id: number,
  cookieHeader?: string,
): Promise<Post> {
  const response = cookieHeader
    ? await serverFetch<PostDetailResponse>(
        `/api/admin/posts/${id}`,
        {},
        cookieHeader,
      )
    : await clientFetch<PostDetailResponse>(`/api/admin/posts/${id}`);

  return response.post;
}

export async function fetchAdminPosts(
  params: FetchAdminPostsParams = {},
  cookieHeader?: string,
): Promise<PaginatedResponse<Post>> {
  const queryString = buildAdminPostSearchParams(params);
  const path = queryString
    ? `/api/admin/posts?${queryString}`
    : "/api/admin/posts";

  return cookieHeader
    ? serverFetch<PaginatedResponse<Post>>(path, {}, cookieHeader)
    : clientFetch<PaginatedResponse<Post>>(path);
}

export async function createPost(body: CreatePostBody): Promise<Post> {
  const response = await clientMutate<PostDetailResponse>("/api/admin/posts", {
    body: JSON.stringify(body),
  });

  return response.post;
}

export async function deletePost(id: number): Promise<void> {
  await clientMutate<void>(`/api/admin/posts/${id}`, {
    method: "DELETE",
  });
}

export async function restorePost(id: number): Promise<Post> {
  const response = await clientMutate<PostDetailResponse>(
    `/api/admin/posts/${id}/restore`,
    {
      method: "PUT",
    },
  );

  return response.post;
}

export async function hardDeletePost(id: number): Promise<void> {
  await clientMutate<void>(`/api/admin/posts/${id}/hard`, {
    method: "DELETE",
  });
}

export async function updatePost(
  id: number,
  body: UpdatePostBody,
): Promise<Post> {
  const response = await clientMutate<PostDetailResponse>(
    `/api/admin/posts/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );

  return response.post;
}

export async function bulkUpdatePosts(action: BulkPostAction): Promise<void> {
  await clientMutate<void>("/api/admin/posts/bulk", {
    method: "PATCH",
    body: JSON.stringify(action),
  });
}
