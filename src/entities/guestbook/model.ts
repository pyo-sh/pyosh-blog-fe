export interface OAuthCommentAuthor {
  type: "oauth";
  id: number;
  name: string;
  avatarUrl?: string;
}

export interface GuestCommentAuthor {
  type: "guest";
  name: string;
  email?: string;
}

export type CommentAuthor = OAuthCommentAuthor | GuestCommentAuthor;

export interface GuestbookEntry {
  id: number;
  parentId: number | null;
  body: string;
  isSecret: boolean;
  status: "active" | "deleted";
  author: CommentAuthor;
  replies: GuestbookEntry[];
  createdAt: string;
  updatedAt: string;
}

interface BaseCreateGuestbookBody {
  body: string;
  parentId?: number;
  isSecret?: boolean;
}

interface CreateGuestbookGuestBody extends BaseCreateGuestbookBody {
  authorType: "guest";
  guestName: string;
  guestEmail: string;
  guestPassword: string;
}

interface CreateGuestbookOAuthBody extends BaseCreateGuestbookBody {
  authorType: "oauth";
}

export type CreateGuestbookBody =
  | CreateGuestbookGuestBody
  | CreateGuestbookOAuthBody;

interface DeleteGuestbookGuestBody {
  guestPassword: string;
}

type DeleteGuestbookOAuthBody = Record<string, never>;

export type DeleteGuestbookBody =
  | DeleteGuestbookGuestBody
  | DeleteGuestbookOAuthBody;

export interface GuestbookEntryResponse {
  data: GuestbookEntry;
}
