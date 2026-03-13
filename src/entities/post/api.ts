import type {
  CreatePostBody,
  FetchPostsParams,
  Post,
  PostDetailResponse,
  PostDetailWithNavigationResponse,
  UpdatePostBody,
} from "./model";
import type { PaginatedResponse } from "@shared/api";
import { clientMutate, serverFetch } from "@shared/api";

function buildPostSearchParams(params: FetchPostsParams): string {
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

export async function fetchAdminPost(
  id: number,
  cookieHeader: string,
): Promise<Post> {
  const response = await serverFetch<PostDetailResponse>(
    `/api/admin/posts/${id}`,
    {},
    cookieHeader,
  );

  return response.post;
}

export async function createPost(body: CreatePostBody): Promise<Post> {
  const response = await clientMutate<PostDetailResponse>("/api/admin/posts", {
    body: JSON.stringify(body),
  });

  return response.post;
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
