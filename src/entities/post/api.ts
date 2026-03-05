import type { CreatePostBody, Post, UpdatePostBody } from "./model";
import { clientMutate, serverFetch } from "@shared/api";

export async function fetchAdminPost(
  id: string,
  cookieHeader: string,
): Promise<Post> {
  return serverFetch<Post>(`/api/admin/posts/${id}`, {}, cookieHeader);
}

export async function createPost(body: CreatePostBody): Promise<Post> {
  return clientMutate<Post>("/api/admin/posts", {
    body: JSON.stringify(body),
  });
}

export async function updatePost(
  id: string,
  body: UpdatePostBody,
): Promise<Post> {
  return clientMutate<Post>(`/api/admin/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
