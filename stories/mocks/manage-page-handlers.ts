import { http, HttpResponse } from "msw";
import { mockAdminCommentsResponse } from "./data/admin-comments";
import { mockAssets } from "./data/assets";
import { mockCategories } from "./data/categories";
import { mockAdminGuestbookEntries } from "./data/guestbook";
import { mockPosts } from "./data/posts";

const API_BASE_URL = "http://localhost:5500";

const adminCategories = mockCategories.map((category, index) => ({
  ...category,
  publishedPostCount: 4 - index,
  totalPostCount: 6 - index,
  children: (category.children ?? []).map((child, childIndex) => ({
    ...child,
    publishedPostCount: 2 - childIndex,
    totalPostCount: 3 - childIndex,
  })),
}));

const adminCommentsEmptyResponse = {
  ...mockAdminCommentsResponse,
  data: [],
  meta: {
    ...mockAdminCommentsResponse.meta,
    total: 0,
    totalPages: 0,
  },
};

const adminGuestbookResponse = {
  data: mockAdminGuestbookEntries,
  meta: {
    total: mockAdminGuestbookEntries.length,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

const adminGuestbookEmptyResponse = {
  ...adminGuestbookResponse,
  data: [],
  meta: {
    ...adminGuestbookResponse.meta,
    total: 0,
    totalPages: 0,
  },
};

const adminAssetsResponse = {
  data: mockAssets,
  meta: {
    total: mockAssets.length,
    page: 1,
    limit: 18,
    totalPages: 1,
  },
};

const adminAssetsEmptyResponse = {
  ...adminAssetsResponse,
  data: [],
  meta: {
    ...adminAssetsResponse.meta,
    total: 0,
    totalPages: 0,
  },
};

function withBaseUrl(path: string) {
  return [`${API_BASE_URL}${path}`, `*${path}`] as const;
}

function jsonGet(
  path: string,
  resolver: () => ReturnType<typeof HttpResponse.json> | HttpResponse<null>,
) {
  return withBaseUrl(path).map((url) => http.get(url, resolver));
}

function emptyMutation(
  method: "post" | "put" | "patch" | "delete",
  path: string,
) {
  return withBaseUrl(path).map((url) =>
    http[method](url, () => new HttpResponse(null, { status: 204 })),
  );
}

function sharedAdminHandlers() {
  return [
    ...jsonGet("/api/auth/csrf-token", () =>
      HttpResponse.json({ token: "storybook-csrf-token" }),
    ),
    ...jsonGet("/api/admin/posts", () =>
      HttpResponse.json({
        data: mockPosts,
        meta: {
          total: mockPosts.length,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      }),
    ),
  ];
}

export function createManageCategoriesHandlers(options?: {
  mode?: "default" | "empty" | "error";
}) {
  const mode = options?.mode ?? "default";
  const categoriesPayload = mode === "empty" ? [] : adminCategories;

  return [
    ...sharedAdminHandlers(),
    ...jsonGet("/api/categories", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json({ categories: categoriesPayload });
    }),
    ...emptyMutation("post", "/api/categories"),
    ...emptyMutation("patch", "/api/categories/tree"),
    ...emptyMutation("patch", "/api/categories/order"),
    ...withBaseUrl("/api/categories/:id").flatMap((url) => [
      http.patch(url, () =>
        HttpResponse.json({ category: categoriesPayload[0] }),
      ),
      http.delete(url, () => new HttpResponse(null, { status: 204 })),
    ]),
  ];
}

export function createManageCommentsHandlers(options?: {
  mode?: "default" | "empty" | "error";
}) {
  const mode = options?.mode ?? "default";

  return [
    ...sharedAdminHandlers(),
    ...jsonGet("/api/admin/comments", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        mode === "empty"
          ? adminCommentsEmptyResponse
          : mockAdminCommentsResponse,
      );
    }),
    ...jsonGet("/api/admin/comments/:id/thread", () => HttpResponse.json([])),
    ...emptyMutation("delete", "/api/admin/comments/bulk"),
    ...emptyMutation("delete", "/api/admin/comments/:id"),
    ...emptyMutation("put", "/api/admin/comments/:id/restore"),
  ];
}

export function createManageGuestbookHandlers(options?: {
  mode?: "default" | "empty" | "error" | "disabled";
}) {
  const mode = options?.mode ?? "default";

  return [
    ...sharedAdminHandlers(),
    ...jsonGet("/api/settings/guestbook", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json({ enabled: mode !== "disabled" });
    }),
    ...jsonGet("/api/admin/guestbook", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        mode === "empty" ? adminGuestbookEmptyResponse : adminGuestbookResponse,
      );
    }),
    ...emptyMutation("patch", "/api/admin/settings/guestbook"),
    ...emptyMutation("delete", "/api/admin/guestbook/bulk"),
    ...emptyMutation("delete", "/api/admin/guestbook/:id"),
  ];
}

export function createManageAssetsHandlers(options?: {
  mode?: "default" | "empty" | "error";
}) {
  const mode = options?.mode ?? "default";

  return [
    ...sharedAdminHandlers(),
    ...jsonGet("/api/assets", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        mode === "empty" ? adminAssetsEmptyResponse : adminAssetsResponse,
      );
    }),
    ...emptyMutation("delete", "/api/assets/bulk"),
    ...emptyMutation("delete", "/api/assets/:id"),
    ...withBaseUrl("/api/assets/upload").map((url) =>
      http.post(url, () =>
        HttpResponse.json({ assets: mockAssets.slice(0, 1) }),
      ),
    ),
  ];
}
