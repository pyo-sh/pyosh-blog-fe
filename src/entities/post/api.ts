import type {
  BulkPostAction,
  CreatePostBody,
  FetchAdminPostsParams,
  FetchPostsParams,
  PinnedPostCountResponse,
  PostDetail,
  PostDetailResponse,
  PostDetailWithNavigationResponse,
  PostListItem,
  PublishedPostListItem,
  PublishedPostSlugsResponse,
  UpdatePostBody,
} from "./model";
import type { PaginatedResponse } from "@shared/api";
import {
  ApiResponseError,
  clientFetch,
  clientMutate,
  serverFetch,
} from "@shared/api";
import { normalizeOptionalAssetUrl } from "@shared/lib/asset-url";
import { decodeSlug, encodeSlugPathSegment } from "@shared/lib/slug";

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
): Promise<PaginatedResponse<PublishedPostListItem>> {
  const queryString = buildPostSearchParams(params);
  const path = queryString ? `/posts?${queryString}` : "/posts";

  const response = await serverFetch<PaginatedResponse<PublishedPostListItem>>(
    path,
    {},
    cookieHeader,
  );

  return normalizePostListResponse(response);
}

export async function fetchPostBySlug(
  slug: string,
  cookieHeader?: string,
): Promise<PostDetailWithNavigationResponse> {
  const buildPath = (value: string) => `/posts/${encodeSlugPathSegment(value)}`;

  try {
    const response = await serverFetch<PostDetailWithNavigationResponse>(
      buildPath(slug),
      {},
      cookieHeader,
    );

    return {
      ...response,
      post: normalizePost(response.post),
    };
  } catch (error) {
    if (!(error instanceof ApiResponseError) || error.statusCode !== 404) {
      throw error;
    }

    const decodedSlug = decodeSlug(slug);

    if (decodedSlug === slug) {
      throw error;
    }

    const response = await serverFetch<PostDetailWithNavigationResponse>(
      buildPath(decodedSlug),
      {},
      cookieHeader,
    );

    return {
      ...response,
      post: normalizePost(response.post),
    };
  }
}

export async function fetchPublishedPostSlugs(
  cookieHeader?: string,
): Promise<PublishedPostSlugsResponse> {
  return serverFetch<PublishedPostSlugsResponse>(
    "/posts/slugs",
    {},
    cookieHeader,
  );
}

export async function fetchAdminPost(
  id: number,
  cookieHeader?: string,
): Promise<PostDetail> {
  const response = cookieHeader
    ? await serverFetch<PostDetailResponse>(
        `/admin/posts/${id}`,
        {},
        cookieHeader,
      )
    : await clientFetch<PostDetailResponse>(`/admin/posts/${id}`);

  return normalizePost(response.post);
}

export async function fetchAdminPosts(
  params: FetchAdminPostsParams = {},
  cookieHeader?: string,
): Promise<PaginatedResponse<PostListItem>> {
  const queryString = buildAdminPostSearchParams(params);
  const path = queryString ? `/admin/posts?${queryString}` : "/admin/posts";

  const response = cookieHeader
    ? await serverFetch<PaginatedResponse<PostListItem>>(path, {}, cookieHeader)
    : await clientFetch<PaginatedResponse<PostListItem>>(path);

  return normalizePostListResponse(response);
}

export async function fetchPinnedPostCount(): Promise<number> {
  const response = await clientFetch<PinnedPostCountResponse>(
    "/admin/posts/pinned-count",
  );

  return response.pinnedCount;
}

export async function createPost(body: CreatePostBody): Promise<PostDetail> {
  const response = await clientMutate<PostDetailResponse>("/admin/posts", {
    body: JSON.stringify(body),
  });

  return normalizePost(response.post);
}

export async function deletePost(id: number): Promise<void> {
  await clientMutate<void>(`/admin/posts/${id}`, {
    method: "DELETE",
  });
}

export async function restorePost(id: number): Promise<PostDetail> {
  const response = await clientMutate<PostDetailResponse>(
    `/admin/posts/${id}/restore`,
    {
      method: "PUT",
    },
  );

  return normalizePost(response.post);
}

export async function hardDeletePost(id: number): Promise<void> {
  await clientMutate<void>(`/admin/posts/${id}/hard`, {
    method: "DELETE",
  });
}

export async function updatePost(
  id: number,
  body: UpdatePostBody,
): Promise<PostDetail> {
  const response = await clientMutate<PostDetailResponse>(
    `/admin/posts/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );

  return normalizePost(response.post);
}

export async function bulkUpdatePosts(action: BulkPostAction): Promise<void> {
  await clientMutate<void>("/admin/posts/bulk", {
    method: "PATCH",
    body: JSON.stringify(action),
  });
}

function normalizePost<T extends PostListItem | PostDetail>(post: T): T {
  return {
    ...post,
    thumbnailUrl: normalizeOptionalAssetUrl(post.thumbnailUrl),
  };
}

function normalizePostListResponse<T extends PostListItem>(
  response: PaginatedResponse<T>,
): PaginatedResponse<T> {
  return {
    ...response,
    data: response.data.map(normalizePost),
  };
}
