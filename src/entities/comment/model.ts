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

export interface CreateCommentGuestBody {
  body: string;
  parentId?: number;
  replyToCommentId?: number;
  isSecret?: boolean;
  guestName: string;
  guestEmail: string;
  guestPassword: string;
}

export interface DeleteCommentGuestBody {
  guestPassword: string;
}

export interface CommentsResponse {
  data: Comment[];
}

export interface CommentResponse {
  data: Comment;
}
