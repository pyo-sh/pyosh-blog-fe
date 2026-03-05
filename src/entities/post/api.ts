import type { CreatePostBody, Post, PostDetailResponse, UpdatePostBody } from "./model";
import { clientMutate, serverFetch } from "@shared/api";

export async function fetchAdminPost(
  id: number,
  cookieHeader?: string,
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
