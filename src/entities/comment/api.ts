import type {
  Comment,
  CommentResponse,
  CommentsResponse,
  CreateCommentBody,
  DeleteCommentBody,
} from "./model";
import { clientMutate, serverFetch } from "@shared/api";

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
