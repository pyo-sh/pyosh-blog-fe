import { http, HttpResponse } from "msw";
import { mockPosts, mockMeta } from "./data/posts";
import { mockCategories } from "./data/categories";
import { mockComments } from "./data/comments";
import {
  mockAdminGuestbookEntries,
  mockGuestbookEntries,
} from "./data/guestbook";
import { mockAssets } from "./data/assets";
import { mockDashboardStats, mockPopularPosts } from "./data/stats";

export const handlers = [
  // Posts
  http.get("/api/posts", () => {
    return HttpResponse.json({ data: mockPosts, meta: mockMeta });
  }),
  http.get("/api/posts/:slug", ({ params }) => {
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
  http.get("/api/admin/posts", () => {
    return HttpResponse.json({ data: mockPosts, meta: mockMeta });
  }),
  http.get("/api/admin/posts/:id", ({ params }) => {
    const post =
      mockPosts.find((p) => p.id === Number(params.id)) ?? mockPosts[0];
    return HttpResponse.json({ post });
  }),

  // Categories
  http.get("/api/categories", () => {
    return HttpResponse.json({ data: mockCategories });
  }),
  http.get("/api/admin/categories", () => {
    return HttpResponse.json({ data: mockCategories });
  }),

  // Comments
  http.get("/api/posts/:slug/comments", () => {
    return HttpResponse.json({ data: mockComments });
  }),
  http.get("/api/admin/comments", () => {
    return HttpResponse.json({
      data: mockComments,
      meta: { total: mockComments.length, page: 1, limit: 10, totalPages: 1 },
    });
  }),

  // Guestbook
  http.get("/api/guestbook", () => {
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
  http.get("/api/admin/guestbook", () => {
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
  http.delete("/api/admin/guestbook/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete("/api/admin/guestbook/bulk", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("/api/settings/guestbook", () => {
    return HttpResponse.json({ enabled: true });
  }),
  http.patch("/api/admin/settings/guestbook", async ({ request }) => {
    const body = (await request.json()) as { enabled: boolean };
    return HttpResponse.json({ enabled: body.enabled });
  }),

  // Assets
  http.get("/api/admin/assets", () => {
    return HttpResponse.json({
      data: mockAssets,
      meta: { total: mockAssets.length, page: 1, limit: 10, totalPages: 1 },
    });
  }),

  // Stats
  http.get("/api/admin/stats/dashboard", () => {
    return HttpResponse.json(mockDashboardStats);
  }),
  http.get("/api/stats/popular", () => {
    return HttpResponse.json({ data: mockPopularPosts });
  }),

  // Auth
  http.get("/api/auth/me", () => {
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
