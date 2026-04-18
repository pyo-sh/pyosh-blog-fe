import type {
  CommentAuthor,
  Comment,
  CommentListMeta,
  CommentResponse,
  CommentsResponse,
  CommentsResponseLegacy,
  CreateCommentBody,
  CreateCommentResponse,
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
  post: { id: number; title: string };
  createdAt: string;
  updatedAt: string;
}

export type AdminCommentStatus = AdminCommentItem["status"];
export type AdminCommentDeleteAction = "soft_delete" | "hard_delete";
export type AdminCommentBulkAction = "restore" | AdminCommentDeleteAction;

export interface FetchAdminCommentsParams {
  page?: number;
  limit?: number;
  postId?: number;
  status?: "active" | "deleted" | "hidden";
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

  if (params.status !== undefined) {
    searchParams.set("status", params.status);
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

function buildCommentListSearchParams(page?: number, limit?: number): string {
  const searchParams = new URLSearchParams();

  if (page !== undefined) {
    searchParams.set("page", String(page));
  }

  if (limit !== undefined) {
    searchParams.set("limit", String(limit));
  }

  return searchParams.toString();
}

function buildCommentListMeta(
  comments: Comment[],
  fallbackPage = 1,
  fallbackLimit = 10,
  options?: {
    isLegacy?: boolean;
  },
): CommentListMeta {
  const totalRootComments = comments.length;

  return {
    page: fallbackPage,
    limit: fallbackLimit,
    totalCount: comments.reduce(
      (count, comment) => count + 1 + comment.replies.length,
      0,
    ),
    totalRootComments,
    totalPages: options?.isLegacy
      ? 1
      : Math.max(1, Math.ceil(totalRootComments / fallbackLimit)),
    isLegacy: options?.isLegacy,
  };
}

function normalizeCommentsResponse(
  response: CommentsResponse | CommentsResponseLegacy,
  page?: number,
  limit = 10,
): CommentsResponse {
  if ("meta" in response) {
    return response;
  }

  return {
    data: response.data,
    meta: buildCommentListMeta(response.data, page ?? 1, limit, {
      isLegacy: true,
    }),
  };
}

export async function fetchComments(
  postId: number,
  options?: {
    page?: number;
    limit?: number;
  },
  cookieHeader?: string,
): Promise<CommentsResponse> {
  const queryString = buildCommentListSearchParams(
    options?.page,
    options?.limit,
  );
  const path = queryString
    ? `/posts/${postId}/comments?${queryString}`
    : `/posts/${postId}/comments`;

  const response = await serverFetch<CommentsResponse | CommentsResponseLegacy>(
    path,
    {},
    cookieHeader,
  );

  return normalizeCommentsResponse(response, options?.page, options?.limit);
}

export async function fetchCommentsClient(
  postId: number,
  options?: {
    page?: number;
    limit?: number;
  },
): Promise<CommentsResponse> {
  const queryString = buildCommentListSearchParams(
    options?.page,
    options?.limit,
  );
  const path = queryString
    ? `/posts/${postId}/comments?${queryString}`
    : `/posts/${postId}/comments`;
  const response = await clientFetch<CommentsResponse | CommentsResponseLegacy>(
    path,
  );

  return normalizeCommentsResponse(response, options?.page, options?.limit);
}

export async function createComment(
  postId: number,
  body: CreateCommentBody,
): Promise<{ comment: Comment; revealToken: string | null }> {
  const { authorType: _authorType, ...payload } = body;
  const response = await clientMutate<CreateCommentResponse>(
    `/posts/${postId}/comments`,
    {
      body: JSON.stringify(payload),
    },
  );

  return {
    comment: response.data,
    revealToken: response.revealToken ?? null,
  };
}

export async function revealSecretComment(
  commentId: number,
  revealToken: string,
): Promise<Comment> {
  const response = await clientMutate<CommentResponse>(
    `/comments/${commentId}/reveal`,
    {
      method: "POST",
      body: JSON.stringify({ revealToken }),
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

  await clientMutate<void>(`/comments/${commentId}`, {
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
    ? `/admin/comments?${queryString}`
    : "/admin/comments";

  return cookieHeader
    ? serverFetch<PaginatedResponse<AdminCommentItem>>(path, {}, cookieHeader)
    : clientFetch<PaginatedResponse<AdminCommentItem>>(path);
}

export async function adminDeleteComment(
  id: number,
  action: AdminCommentDeleteAction = "soft_delete",
): Promise<void> {
  await clientMutate<void>(`/admin/comments/${id}?action=${action}`, {
    method: "DELETE",
  });
}

export async function adminRestoreComment(id: number): Promise<void> {
  await clientMutate<void>(`/admin/comments/${id}/restore`, {
    method: "PUT",
  });
}

export async function adminHideComment(id: number): Promise<void> {
  await clientMutate<void>(`/admin/comments/${id}/hide`, {
    method: "PUT",
  });
}

export async function adminBulkOperateComments(
  ids: number[],
  action: AdminCommentBulkAction,
): Promise<void> {
  await clientMutate<void>("/admin/comments/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, action }),
  });
}

export async function fetchAdminCommentThread(
  id: number,
): Promise<AdminCommentItem[]> {
  const response = await clientFetch<{
    parent: AdminCommentItem;
    replies: AdminCommentItem[];
  }>(`/admin/comments/${id}/thread`);

  return [response.parent, ...response.replies];
}
