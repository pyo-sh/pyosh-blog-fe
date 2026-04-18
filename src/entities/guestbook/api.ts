import type {
  CommentAuthor,
  CreateGuestbookBody,
  DeleteGuestbookBody,
  GuestbookEntry,
  GuestbookEntryResponse,
} from "./model";
import type { PaginatedResponse } from "@shared/api";
import { clientFetch, clientMutate, serverFetch } from "@shared/api";

export type AdminGuestbookStatus = "active" | "deleted" | "hidden";
export type AdminGuestbookFilterStatus = AdminGuestbookStatus | "all";
export type AdminGuestbookAuthorType = "oauth" | "guest";
export type AdminGuestbookDeleteAction = "soft_delete" | "hard_delete";
export type AdminGuestbookPatchAction = "hide" | "restore";

export interface AdminGuestbookItem {
  id: number;
  parentId: number | null;
  body: string;
  isSecret: boolean;
  status: AdminGuestbookStatus;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface GuestbookSettingsResponse {
  enabled: boolean;
}

export interface FetchAdminGuestbookParams {
  page?: number;
  limit?: number;
  status?: AdminGuestbookFilterStatus;
  authorType?: AdminGuestbookAuthorType | "all";
  q?: string;
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

  if (params.status !== undefined && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  if (params.authorType !== undefined && params.authorType !== "all") {
    searchParams.set("authorType", params.authorType);
  }

  if (params.q !== undefined && params.q.trim()) {
    searchParams.set("q", params.q.trim());
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
    `/guestbook?page=${page}`,
    {},
    cookieHeader,
  );
}

export async function createGuestbookEntry(
  body: CreateGuestbookBody,
): Promise<GuestbookEntry> {
  const { authorType: _authorType, ...payload } = body;
  const response = await clientMutate<GuestbookEntryResponse>("/guestbook", {
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function deleteGuestbookEntry(
  id: number,
  body: DeleteGuestbookBody,
): Promise<void> {
  await clientMutate<void>(`/guestbook/${id}`, {
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
    ? `/admin/guestbook?${queryString}`
    : "/admin/guestbook";

  return cookieHeader
    ? serverFetch<PaginatedResponse<AdminGuestbookItem>>(path, {}, cookieHeader)
    : clientFetch<PaginatedResponse<AdminGuestbookItem>>(path);
}

export async function adminDeleteGuestbookEntry(
  id: number,
  action: AdminGuestbookDeleteAction,
): Promise<void> {
  await clientMutate<void>(`/admin/guestbook/${id}?action=${action}`, {
    method: "DELETE",
  });
}

export async function adminPatchGuestbookEntry(
  id: number,
  action: AdminGuestbookPatchAction,
): Promise<void> {
  await clientMutate<void>(`/admin/guestbook/${id}?action=${action}`, {
    method: "PATCH",
  });
}

export async function adminBulkDeleteGuestbookEntries(
  ids: number[],
  action: AdminGuestbookDeleteAction,
): Promise<void> {
  await clientMutate<void>("/admin/guestbook/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, action }),
  });
}

export async function adminBulkPatchGuestbookEntries(
  ids: number[],
  action: AdminGuestbookPatchAction,
): Promise<void> {
  await clientMutate<void>("/admin/guestbook/bulk", {
    method: "PATCH",
    body: JSON.stringify({ ids, action }),
  });
}

export async function fetchGuestbookSettings(
  cookieHeader?: string,
): Promise<GuestbookSettingsResponse> {
  if (typeof window === "undefined") {
    return serverFetch<GuestbookSettingsResponse>(
      "/settings/guestbook",
      {},
      cookieHeader,
    );
  }

  return clientFetch<GuestbookSettingsResponse>("/settings/guestbook");
}

export async function updateGuestbookSettings(
  enabled: boolean,
): Promise<GuestbookSettingsResponse> {
  return clientMutate<GuestbookSettingsResponse>("/admin/settings/guestbook", {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}
