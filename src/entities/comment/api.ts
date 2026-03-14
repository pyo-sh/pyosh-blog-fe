import type {
  Comment,
  CommentResponse,
  CommentsResponse,
  CreateCommentGuestBody,
  DeleteCommentGuestBody,
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
  body: CreateCommentGuestBody,
): Promise<Comment> {
  const response = await clientMutate<CommentResponse>(
    `/api/posts/${postId}/comments`,
    {
      body: JSON.stringify(body),
    },
  );

  return response.data;
}

export async function deleteComment(
  commentId: number,
  body: DeleteCommentGuestBody,
): Promise<void> {
  await clientMutate<void>(`/api/comments/${commentId}`, {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}
