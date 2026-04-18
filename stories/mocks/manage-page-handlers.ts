import { http, HttpResponse } from "msw";
import {
  mockAdminCommentsResponse,
  mockAdminCommentThreadResponses,
} from "./data/admin-comments";
import { mockAssets } from "./data/assets";
import { mockCategories } from "./data/categories";
import { mockAdminGuestbookEntries } from "./data/guestbook";
import { mockPosts } from "./data/posts";

const API_BASE_URL = "http://localhost:5500";
const STORYBOOK_TIMESTAMP = "2026-04-02T09:00:00.000Z";

const mockCurrentAdminUser = {
  type: "admin" as const,
  id: 1,
  username: "admin",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
  lastLoginAt: "2026-04-02T08:30:00.000Z",
};

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

function jsonMutation(
  method: "post" | "put" | "patch",
  path: string,
  resolver: Parameters<(typeof http)[typeof method]>[1],
) {
  return withBaseUrl(path).map((url) => http[method](url, resolver));
}

function sharedAdminHandlers() {
  return [
    ...jsonGet("/auth/csrf-token", () =>
      HttpResponse.json({ token: "storybook-csrf-token" }),
    ),
    ...jsonGet("/auth/me", () => HttpResponse.json(mockCurrentAdminUser)),
    ...withBaseUrl("/auth/admin/logout").map((url) =>
      http.post(url, () => new HttpResponse(null, { status: 204 })),
    ),
    ...jsonGet("/admin/posts", () =>
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
    ...jsonGet("/categories", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json({ categories: categoriesPayload });
    }),
    ...jsonMutation("post", "/categories", async ({ request }) => {
      const body = (await request.json()) as {
        name?: string;
        parentId?: number | null;
        isVisible?: boolean;
      };

      return HttpResponse.json({
        category: {
          id: Date.now(),
          parentId: body.parentId ?? null,
          name: body.name?.trim() || "새 카테고리",
          slug:
            body.name
              ?.trim()
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-_]/g, "") || "new-category",
          sortOrder: categoriesPayload.length,
          isVisible: body.isVisible ?? true,
          createdAt: STORYBOOK_TIMESTAMP,
          updatedAt: STORYBOOK_TIMESTAMP,
          publishedPostCount: 0,
          totalPostCount: 0,
          children: [],
        },
      });
    }),
    ...emptyMutation("patch", "/categories/tree"),
    ...emptyMutation("patch", "/categories/order"),
    ...withBaseUrl("/categories/:id").flatMap((url) => [
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
    ...jsonGet("/admin/comments", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        mode === "empty"
          ? adminCommentsEmptyResponse
          : mockAdminCommentsResponse,
      );
    }),
    ...withBaseUrl("/admin/comments/:id/thread").map((url) =>
      http.get(url, ({ params }) => {
        const id = Number(params.id);
        const payload = mockAdminCommentThreadResponses[id];

        if (!payload) {
          return HttpResponse.json({
            parent: mockAdminCommentsResponse.data[0],
            replies: [],
          });
        }

        return HttpResponse.json(payload);
      }),
    ),
    ...emptyMutation("delete", "/admin/comments/bulk"),
    ...emptyMutation("delete", "/admin/comments/:id"),
    ...emptyMutation("put", "/admin/comments/:id/restore"),
  ];
}

export function createManageGuestbookHandlers(options?: {
  mode?: "default" | "empty" | "error" | "disabled";
}) {
  const mode = options?.mode ?? "default";

  return [
    ...sharedAdminHandlers(),
    ...jsonGet("/settings/guestbook", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json({ enabled: mode !== "disabled" });
    }),
    ...jsonGet("/admin/guestbook", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        mode === "empty" ? adminGuestbookEmptyResponse : adminGuestbookResponse,
      );
    }),
    ...jsonMutation(
      "patch",
      "/admin/settings/guestbook",
      async ({ request }) => {
        const body = (await request.json()) as { enabled?: boolean };

        return HttpResponse.json({ enabled: body.enabled ?? false });
      },
    ),
    ...emptyMutation("delete", "/admin/guestbook/bulk"),
    ...emptyMutation("delete", "/admin/guestbook/:id"),
  ];
}

export function createManageAssetsHandlers(options?: {
  mode?: "default" | "empty" | "error";
}) {
  const mode = options?.mode ?? "default";

  return [
    ...sharedAdminHandlers(),
    ...jsonGet("/assets", () => {
      if (mode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        mode === "empty" ? adminAssetsEmptyResponse : adminAssetsResponse,
      );
    }),
    ...emptyMutation("delete", "/assets/bulk"),
    ...emptyMutation("delete", "/assets/:id"),
    ...withBaseUrl("/assets/upload").map((url) =>
      http.post(url, () =>
        HttpResponse.json({ assets: mockAssets.slice(0, 1) }),
      ),
    ),
  ];
}
