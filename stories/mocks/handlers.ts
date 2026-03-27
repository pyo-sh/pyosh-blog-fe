import { http, HttpResponse } from "msw";
import { mockPosts, mockMeta } from "./data/posts";
import { mockCategories } from "./data/categories";
import { mockComments } from "./data/comments";
import { mockGuestbookEntries } from "./data/guestbook";
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
      nextPost: { slug: "nextjs-app-router-guide", title: "Next.js App Router 완전 가이드" },
    });
  }),

  // Admin posts
  http.get("/api/admin/posts", () => {
    return HttpResponse.json({ data: mockPosts, meta: mockMeta });
  }),
  http.get("/api/admin/posts/:id", ({ params }) => {
    const post = mockPosts.find((p) => p.id === Number(params.id)) ?? mockPosts[0];
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
    return HttpResponse.json({ data: mockComments, meta: mockMeta });
  }),

  // Guestbook
  http.get("/api/guestbook", () => {
    return HttpResponse.json({ data: mockGuestbookEntries, meta: mockMeta });
  }),
  http.get("/api/admin/guestbook", () => {
    return HttpResponse.json({ data: mockGuestbookEntries, meta: mockMeta });
  }),

  // Assets
  http.get("/api/admin/assets", () => {
    return HttpResponse.json({ data: mockAssets, meta: mockMeta });
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
