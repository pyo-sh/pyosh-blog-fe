export type {
  CommentAuthor,
  Comment,
  CreateCommentBody,
  CreateCommentGuestBody,
  CreateCommentOAuthBody,
  DeleteCommentBody,
  DeleteCommentGuestBody,
  DeleteCommentOAuthBody,
} from "./model";
export { fetchComments, createComment, deleteComment } from "./api";
