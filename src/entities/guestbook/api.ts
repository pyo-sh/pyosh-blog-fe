import type {
  CommentAuthor,
  CreateGuestbookBody,
  DeleteGuestbookBody,
  GuestbookEntry,
  GuestbookEntryResponse,
} from "./model";
import type { PaginatedResponse } from "@shared/api";
import { clientFetch, clientMutate, serverFetch } from "@shared/api";

export interface AdminGuestbookItem {
  id: number;
  parentId: number | null;
  body: string;
  isSecret: boolean;
  status: "active" | "deleted";
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface FetchAdminGuestbookParams {
  page?: number;
  limit?: number;
  authorType?: "oauth" | "guest";
  startDate?: string;
  endDate?: string;
}

function buildAdminGuestbookSearchParams(
  params: FetchAdminGuestbookParams,
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
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

export async function fetchGuestbook(
  page = 1,
  cookieHeader?: string,
): Promise<PaginatedResponse<GuestbookEntry>> {
  return serverFetch<PaginatedResponse<GuestbookEntry>>(
    `/api/guestbook?page=${page}`,
    {},
    cookieHeader,
  );
}

export async function createGuestbookEntry(
  body: CreateGuestbookBody,
): Promise<GuestbookEntry> {
  const { authorType: _authorType, ...payload } = body;
  const response = await clientMutate<GuestbookEntryResponse>(
    "/api/guestbook",
    {
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteGuestbookEntry(
  id: number,
  body: DeleteGuestbookBody,
): Promise<void> {
  await clientMutate<void>(`/api/guestbook/${id}`, {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}

export async function fetchAdminGuestbook(
  params: FetchAdminGuestbookParams = {},
  cookieHeader?: string,
): Promise<PaginatedResponse<AdminGuestbookItem>> {
  const queryString = buildAdminGuestbookSearchParams(params);
  const path = queryString
    ? `/api/admin/guestbook?${queryString}`
    : "/api/admin/guestbook";

  return cookieHeader
    ? serverFetch<PaginatedResponse<AdminGuestbookItem>>(path, {}, cookieHeader)
    : clientFetch<PaginatedResponse<AdminGuestbookItem>>(path);
}

export async function adminDeleteGuestbookEntry(id: number): Promise<void> {
  await clientMutate<void>(`/api/admin/guestbook/${id}`, {
    method: "DELETE",
  });
}
