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

export interface CreateGuestbookBody {
  body: string;
  parentId?: number;
  isSecret?: boolean;
  guestName: string;
  guestEmail: string;
  guestPassword: string;
}

export interface DeleteGuestbookBody {
  guestPassword: string;
}

export interface GuestbookEntryResponse {
  data: GuestbookEntry;
}
