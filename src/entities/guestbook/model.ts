export interface CommentAuthor {
  type: "oauth" | "guest";
  id?: number;
  name: string;
  email?: string;
  avatarUrl?: string;
}

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
  guestName: string;
  guestEmail: string;
  guestPassword: string;
}

interface CreateGuestbookOAuthBody extends BaseCreateGuestbookBody {
  guestName?: never;
  guestEmail?: never;
  guestPassword?: never;
}

export type CreateGuestbookBody =
  | CreateGuestbookGuestBody
  | CreateGuestbookOAuthBody;

export interface DeleteGuestbookBody {
  guestPassword: string;
}

export interface GuestbookEntryResponse {
  data: GuestbookEntry;
}
