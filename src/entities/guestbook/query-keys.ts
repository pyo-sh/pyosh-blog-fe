import type { FetchAdminGuestbookParams } from "./api";

export interface PublicGuestbookListKeyParams {
  page?: number;
}

function normalizePublicGuestbookListParams(
  params: PublicGuestbookListKeyParams = {},
) {
  return {
    page: params.page,
  };
}

function normalizeAdminGuestbookListParams(
  params: FetchAdminGuestbookParams = {},
) {
  return {
    page: params.page,
    limit: params.limit,
    status: params.status,
    authorType: params.authorType,
    q: params.q,
    startDate: params.startDate,
    endDate: params.endDate,
  };
}

export const publicGuestbookKeys = {
  all: () => ["public", "guestbook"] as const,
  list: (params: PublicGuestbookListKeyParams = {}) =>
    [
      ...publicGuestbookKeys.all(),
      "list",
      normalizePublicGuestbookListParams(params),
    ] as const,
  settings: () => [...publicGuestbookKeys.all(), "settings"] as const,
};

export const adminGuestbookKeys = {
  all: () => ["admin", "guestbook"] as const,
  list: (params: FetchAdminGuestbookParams = {}) =>
    [
      ...adminGuestbookKeys.all(),
      "list",
      normalizeAdminGuestbookListParams(params),
    ] as const,
  settings: () => [...adminGuestbookKeys.all(), "settings"] as const,
};
