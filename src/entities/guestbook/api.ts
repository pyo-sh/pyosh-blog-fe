import type {
  CreateGuestbookBody,
  DeleteGuestbookBody,
  GuestbookEntry,
  GuestbookEntryResponse,
} from "./model";
import type { PaginatedResponse } from "@shared/api";
import { clientMutate, serverFetch } from "@shared/api";

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
  const response = await clientMutate<GuestbookEntryResponse>(
    "/api/guestbook",
    {
      body: JSON.stringify(body),
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
