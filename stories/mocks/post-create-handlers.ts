import { http, HttpResponse } from "msw";
import type { CreatePostBody, Post } from "@entities/post";
import { mockAssets } from "./data/assets";
import { mockCategories } from "./data/categories";
import { mockPosts } from "./data/posts";
import { mockTags } from "./data/tags";

const API_BASE_URL = "http://localhost:5500";

function buildPostFromCreateBody(body: CreatePostBody): Post {
  const category =
    mockCategories.find((item) => item.id === body.categoryId) ?? mockCategories[0];
  const now = "2026-04-01T09:00:00.000Z";

  return {
    id: 999,
    categoryId: body.categoryId,
    title: body.title,
    slug: "storybook-created-post",
    contentMd: body.contentMd,
    thumbnailUrl: body.thumbnailUrl ?? null,
    visibility: body.visibility ?? "public",
    status: body.status ?? "draft",
    commentStatus: body.commentStatus ?? "open",
    publishedAt: body.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    summary: body.summary ?? null,
    description: body.description ?? null,
    isPinned: false,
    totalPageviews: 0,
    commentCount: 0,
    contentModifiedAt: now,
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
    tags: (body.tags ?? []).map((tag, index) => ({
      id: index + 1,
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, "-"),
    })),
  };
}

export const postCreateHandlers = [
  http.get(`${API_BASE_URL}/auth/csrf-token`, () => {
    return HttpResponse.json({ token: "storybook-csrf-token" });
  }),

  http.get(`${API_BASE_URL}/categories`, ({ request }) => {
    const url = new URL(request.url);
    const includeHidden = url.searchParams.get("include_hidden");

    if (includeHidden === "true") {
      return HttpResponse.json({ categories: mockCategories });
    }

    return HttpResponse.json({ categories: mockCategories });
  }),

  http.get(`${API_BASE_URL}/tags`, () => {
    return HttpResponse.json({ tags: mockTags });
  }),

  http.get(`${API_BASE_URL}/assets`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "18");

    return HttpResponse.json({
      data: mockAssets,
      meta: {
        page,
        limit,
        total: mockAssets.length,
        totalPages: 1,
      },
    });
  }),

  http.post(`${API_BASE_URL}/assets/upload`, () => {
    return HttpResponse.json({
      assets: mockAssets.slice(0, 1).map((asset) => ({
        id: asset.id,
        url: asset.url,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        width: asset.width,
        height: asset.height,
      })),
    });
  }),

  http.post(`${API_BASE_URL}/admin/posts`, async ({ request }) => {
    const body = (await request.json()) as CreatePostBody;

    return HttpResponse.json({
      post: buildPostFromCreateBody(body),
    });
  }),

  http.get(`${API_BASE_URL}/admin/posts`, () => {
    return HttpResponse.json({
      data: mockPosts,
      meta: {
        page: 1,
        limit: 10,
        total: mockPosts.length,
        totalPages: 1,
      },
    });
  }),
];
