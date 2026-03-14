import type {
  CommentAuthor,
  Comment,
  CommentResponse,
  CommentsResponse,
  CreateCommentBody,
  DeleteCommentBody,
} from "./model";
import type { PaginatedResponse } from "@shared/api";
import { clientFetch, clientMutate, serverFetch } from "@shared/api";

export interface AdminCommentItem {
  id: number;
  postId: number;
  parentId: number | null;
  depth: number;
  body: string;
  isSecret: boolean;
  status: "active" | "deleted" | "hidden";
  author: CommentAuthor;
  replyToName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FetchAdminCommentsParams {
  page?: number;
  limit?: number;
  postId?: number;
  authorType?: "oauth" | "guest";
  startDate?: string;
  endDate?: string;
}

function buildAdminCommentSearchParams(
  params: FetchAdminCommentsParams,
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.postId !== undefined) {
    searchParams.set("postId", String(params.postId));
  }

  if (params.authorType !== undefined) {
    searchParams.set("authorType", params.authorType);
  }

  if (params.startDate !== undefined) {
    searchParams.set("startDate", params.startDate);
  }

  if (params.endDate !== undefined) {
    searchParams.set("endDate", params.endDate);
  }

  return searchParams.toString();
}

export async function fetchComments(
  postId: number,
  cookieHeader?: string,
): Promise<Comment[]> {
  const response = await serverFetch<CommentsResponse>(
    `/api/posts/${postId}/comments`,
    {},
    cookieHeader,
  );

  return response.data;
}

export async function createComment(
  postId: number,
  body: CreateCommentBody,
): Promise<Comment> {
  const { authorType: _authorType, ...payload } = body;
  const response = await clientMutate<CommentResponse>(
    `/api/posts/${postId}/comments`,
    {
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteComment(
  commentId: number,
  body: DeleteCommentBody,
): Promise<void> {
  const payload =
    body.authorType === "guest" ? { guestPassword: body.guestPassword } : {};

  await clientMutate<void>(`/api/comments/${commentId}`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminComments(
  params: FetchAdminCommentsParams = {},
  cookieHeader?: string,
): Promise<PaginatedResponse<AdminCommentItem>> {
  const queryString = buildAdminCommentSearchParams(params);
  const path = queryString
    ? `/api/admin/comments?${queryString}`
    : "/api/admin/comments";

  return cookieHeader
    ? serverFetch<PaginatedResponse<AdminCommentItem>>(path, {}, cookieHeader)
    : clientFetch<PaginatedResponse<AdminCommentItem>>(path);
}

export async function adminDeleteComment(id: number): Promise<void> {
  await clientMutate<void>(`/api/admin/comments/${id}`, {
    method: "DELETE",
  });
}
