export type {
  CommentAuthor,
  GuestbookEntry,
  CreateGuestbookBody,
  DeleteGuestbookBody,
} from "./model";
export type { AdminGuestbookItem, FetchAdminGuestbookParams } from "./api";
export {
  adminDeleteGuestbookEntry,
  fetchGuestbook,
  fetchAdminGuestbook,
  createGuestbookEntry,
  deleteGuestbookEntry,
} from "./api";
