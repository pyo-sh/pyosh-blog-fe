export interface CommentAuthor {
  type: "oauth" | "guest";
  id?: number;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface Comment {
  id: number;
  postId: number;
  parentId: number | null;
  depth: number;
  body: string;
  isSecret: boolean;
  status: "active" | "deleted";
  author: CommentAuthor;
  replyToName: string | null;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentListMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalRootComments: number;
  totalPages: number;
  isLegacy?: boolean;
}

export interface CreateCommentGuestBody {
  authorType: "guest";
  body: string;
  parentId?: number;
  replyToCommentId?: number;
  isSecret?: boolean;
  guestName: string;
  guestEmail?: string;
  guestPassword: string;
}

export interface CreateCommentOAuthBody {
  authorType: "oauth";
  body: string;
  parentId?: number;
  replyToCommentId?: number;
  isSecret?: boolean;
}

export type CreateCommentBody = CreateCommentGuestBody | CreateCommentOAuthBody;

export interface DeleteCommentGuestBody {
  authorType: "guest";
  guestPassword: string;
}

export interface DeleteCommentOAuthBody {
  authorType: "oauth";
}

export type DeleteCommentBody = DeleteCommentGuestBody | DeleteCommentOAuthBody;

export interface CommentsResponseLegacy {
  data: Comment[];
}

export interface CommentsResponse {
  data: Comment[];
  meta: CommentListMeta;
}

export interface CommentResponse {
  data: Comment;
}

export interface CreateCommentResponse {
  data: Comment;
  revealToken?: string | null;
}
