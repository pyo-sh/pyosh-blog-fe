import { http, HttpResponse } from "msw";
import type { BulkPostAction, Post, UpdatePostBody } from "@entities/post";
import { mockCategories } from "./data/categories";
import { mockMeta, mockPosts } from "./data/posts";

const API_BASE_URL = "http://localhost:5500";

function createSeedPosts() {
  return mockPosts.map((post, index): Post => ({
    ...post,
    commentStatus:
      index % 3 === 0 ? "open" : index % 3 === 1 ? "locked" : "disabled",
  }));
}

function filterPosts(
  posts: Post[],
  searchParams: URLSearchParams,
  includeDeleted: boolean,
) {
  const status = searchParams.get("status");
  const visibility = searchParams.get("visibility");
  const categoryId = searchParams.get("categoryId");
  const query = searchParams.get("q")?.trim().toLowerCase();

  return posts.filter((post) => {
    if (Boolean(post.deletedAt) !== includeDeleted) {
      return false;
    }

    if (status && post.status !== status) {
      return false;
    }

    if (visibility && post.visibility !== visibility) {
      return false;
    }

    if (categoryId && post.categoryId !== Number(categoryId)) {
      return false;
    }

    if (
      query &&
      !post.title.toLowerCase().includes(query) &&
      !(post.summary ?? "").toLowerCase().includes(query)
    ) {
      return false;
    }

    return true;
  });
}

function sortPosts(posts: Post[], searchParams: URLSearchParams) {
  const sort = searchParams.get("sort");
  const order = searchParams.get("order") === "asc" ? 1 : -1;

  if (!sort) {
    return posts;
  }

  const sorted = [...posts];

  sorted.sort((left, right) => {
    if (sort === "totalPageviews") {
      return (left.totalPageviews - right.totalPageviews) * order;
    }

    if (sort === "commentCount") {
      return (left.commentCount - right.commentCount) * order;
    }

    if (sort === "published_at") {
      return (
        ((left.publishedAt ? Date.parse(left.publishedAt) : 0) -
          (right.publishedAt ? Date.parse(right.publishedAt) : 0)) * order
      );
    }

    if (sort === "created_at") {
      return (Date.parse(left.createdAt) - Date.parse(right.createdAt)) * order;
    }

    return 0;
  });

  return sorted;
}

function paginatePosts(posts: Post[], searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? mockMeta.page);
  const limit = Number(searchParams.get("limit") ?? mockMeta.limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: posts.slice(start, end),
    meta: {
      total: posts.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(posts.length / limit)),
    },
  };
}

export function createPostListHandlers(options?: {
  mode?: "default" | "empty" | "error";
}) {
  const mode = options?.mode ?? "default";
  let activePosts = mode === "empty" ? [] : createSeedPosts();
  let trashPosts: Post[] =
    mode === "default"
      ? [
          {
            ...mockPosts[1],
            id: 99,
            title: "휴지통에 있는 글",
            deletedAt: "2026-03-20T12:00:00.000Z",
            visibility: "private",
            isPinned: false,
            commentStatus: "disabled",
          },
        ]
      : [];

  function findPost(id: number) {
    return (
      activePosts.find((post) => post.id === id) ??
      trashPosts.find((post) => post.id === id) ??
      null
    );
  }

  return [
    http.get(`${API_BASE_URL}/api/auth/csrf-token`, () =>
      HttpResponse.json({ token: "storybook-csrf-token" }),
    ),

    http.get(`${API_BASE_URL}/api/categories`, () =>
      HttpResponse.json({ categories: mockCategories }),
    ),

    http.get(`${API_BASE_URL}/api/admin/posts/pinned-count`, () =>
      HttpResponse.json({
        pinnedCount: activePosts.filter((post) => post.isPinned).length,
      }),
    ),

    http.get(`${API_BASE_URL}/api/admin/posts`, ({ request }) => {
      if (mode === "error") {
        return HttpResponse.json(
          { statusCode: 500, message: "스토리북 글 목록 로딩 실패" },
          { status: 500 },
        );
      }

      const url = new URL(request.url);
      const includeDeleted = url.searchParams.get("includeDeleted") === "true";
      const source = includeDeleted ? trashPosts : activePosts;
      const filtered = filterPosts(source, url.searchParams, includeDeleted);
      const sorted = sortPosts(filtered, url.searchParams);

      return HttpResponse.json(paginatePosts(sorted, url.searchParams));
    }),

    http.patch(`${API_BASE_URL}/api/admin/posts/bulk`, async ({ request }) => {
      const body = (await request.json()) as BulkPostAction;

      if (body.action === "soft_delete") {
        const moved = activePosts.filter((post) => body.ids.includes(post.id));
        activePosts = activePosts.filter((post) => !body.ids.includes(post.id));
        trashPosts = [
          ...moved.map((post) => ({
            ...post,
            deletedAt: "2026-04-01T09:00:00.000Z",
            isPinned: false,
          })),
          ...trashPosts,
        ];
      }

      if (body.action === "restore") {
        const restored = trashPosts.filter((post) => body.ids.includes(post.id));
        trashPosts = trashPosts.filter((post) => !body.ids.includes(post.id));
        activePosts = [
          ...restored.map((post) => ({ ...post, deletedAt: null })),
          ...activePosts,
        ];
      }

      if (body.action === "hard_delete") {
        trashPosts = trashPosts.filter((post) => !body.ids.includes(post.id));
      }

      if (body.action === "update") {
        activePosts = activePosts.map((post) => {
          if (!body.ids.includes(post.id)) {
            return post;
          }

          const category = body.categoryId
            ? mockCategories.find((item) => item.id === body.categoryId) ??
              post.category
            : post.category;

          return {
            ...post,
            categoryId: body.categoryId ?? post.categoryId,
            category: {
              id: category.id,
              name: category.name,
              slug: category.slug,
            },
            commentStatus: body.commentStatus ?? post.commentStatus,
            visibility: body.visibility ?? post.visibility,
          };
        });
      }

      return new HttpResponse(null, { status: 204 });
    }),

    http.patch(
      `${API_BASE_URL}/api/admin/posts/:id`,
      async ({ params, request }) => {
        const id = Number(params.id);
        const body = (await request.json()) as UpdatePostBody;

        activePosts = activePosts.map((post) => {
          if (post.id !== id) {
            return post;
          }

          return {
            ...post,
            visibility: body.visibility ?? post.visibility,
            isPinned: body.isPinned ?? post.isPinned,
          };
        });

        return HttpResponse.json({
          post: activePosts.find((post) => post.id === id) ?? findPost(id),
        });
      },
    ),

    http.delete(`${API_BASE_URL}/api/admin/posts/:id`, ({ params }) => {
      const id = Number(params.id);
      const target = activePosts.find((post) => post.id === id);

      if (target) {
        activePosts = activePosts.filter((post) => post.id !== id);
        trashPosts = [
          {
            ...target,
            deletedAt: "2026-04-01T09:00:00.000Z",
            isPinned: false,
          },
          ...trashPosts,
        ];
      }

      return new HttpResponse(null, { status: 204 });
    }),

    http.put(`${API_BASE_URL}/api/admin/posts/:id/restore`, ({ params }) => {
      const id = Number(params.id);
      const target = trashPosts.find((post) => post.id === id);

      if (target) {
        trashPosts = trashPosts.filter((post) => post.id !== id);
        activePosts = [{ ...target, deletedAt: null }, ...activePosts];
      }

      return HttpResponse.json({
        post: activePosts.find((post) => post.id === id) ?? findPost(id),
      });
    }),

    http.delete(`${API_BASE_URL}/api/admin/posts/:id/hard`, ({ params }) => {
      const id = Number(params.id);
      trashPosts = trashPosts.filter((post) => post.id !== id);

      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

export const postListHandlers = createPostListHandlers();
export const postListEmptyHandlers = createPostListHandlers({ mode: "empty" });
export const postListErrorHandlers = createPostListHandlers({ mode: "error" });
