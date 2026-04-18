import { http, HttpResponse } from "msw";
import { mockPosts, mockMeta } from "./data/posts";
import { mockCategories } from "./data/categories";
import { mockComments, mockCommentMeta } from "./data/comments";
import {
  mockAdminGuestbookEntries,
  mockGuestbookEntries,
} from "./data/guestbook";
import { mockAssets } from "./data/assets";
import { mockDashboardStats, mockPopularPosts } from "./data/stats";

export const handlers = [
  // Posts
  http.get("/posts", () => {
    return HttpResponse.json({ data: mockPosts, meta: mockMeta });
  }),
  http.get("/posts/:slug", ({ params }) => {
    const post = mockPosts.find((p) => p.slug === params.slug) ?? mockPosts[0];
    return HttpResponse.json({
      post,
      prevPost: null,
      nextPost: {
        slug: "nextjs-app-router-guide",
        title: "Next.js App Router 완전 가이드",
      },
    });
  }),

  // Admin posts
  http.get("/admin/posts", () => {
    return HttpResponse.json({ data: mockPosts, meta: mockMeta });
  }),
  http.get("/admin/posts/:id", ({ params }) => {
    const post =
      mockPosts.find((p) => p.id === Number(params.id)) ?? mockPosts[0];
    return HttpResponse.json({ post });
  }),

  // Categories
  http.get("/categories", () => {
    return HttpResponse.json({ categories: mockCategories });
  }),

  // Comments
  http.get("/posts/:postId/comments", () => {
    return HttpResponse.json({ data: mockComments, meta: mockCommentMeta });
  }),
  http.get("/admin/comments", () => {
    return HttpResponse.json({
      data: mockComments,
      meta: { total: mockComments.length, page: 1, limit: 10, totalPages: 1 },
    });
  }),

  // Guestbook
  http.get("/guestbook", () => {
    return HttpResponse.json({
      data: mockGuestbookEntries,
      meta: {
        total: mockGuestbookEntries.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),
  http.get("/admin/guestbook", () => {
    return HttpResponse.json({
      data: mockAdminGuestbookEntries,
      meta: {
        total: mockAdminGuestbookEntries.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),
  http.delete("/admin/guestbook/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete("/admin/guestbook/bulk", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("/settings/guestbook", () => {
    return HttpResponse.json({ enabled: true });
  }),
  http.patch("/admin/settings/guestbook", async ({ request }) => {
    const body = (await request.json()) as { enabled: boolean };
    return HttpResponse.json({ enabled: body.enabled });
  }),

  // Assets
  http.get("/assets", () => {
    return HttpResponse.json({
      data: mockAssets,
      meta: { total: mockAssets.length, page: 1, limit: 10, totalPages: 1 },
    });
  }),

  // Stats
  http.get("/admin/stats/dashboard", () => {
    return HttpResponse.json(mockDashboardStats);
  }),
  http.get("/stats/popular", () => {
    return HttpResponse.json({ data: mockPopularPosts });
  }),

  // Auth
  http.get("/auth/me", () => {
    return HttpResponse.json({
      type: "admin",
      id: 1,
      username: "admin",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      lastLoginAt: "2026-03-27T09:00:00.000Z",
    });
  }),
];
