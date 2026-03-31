import { http, HttpResponse } from "msw";
import { mockAdminCommentsResponse } from "./data/admin-comments";
import { mockDashboardStats } from "./data/stats";

const dashboardStatsPayload = mockDashboardStats;

const emptyDashboardStatsPayload = {
  ...mockDashboardStats,
  todayPageviews: 0,
  weekPageviews: 0,
  monthPageviews: 0,
  totalPosts: 0,
  totalComments: 0,
  postsByStatus: {
    draft: 0,
    published: 0,
    archived: 0,
  },
};

function createDashboardHandlers(options?: {
  stats?: "default" | "empty" | "error";
  comments?: "default" | "empty" | "error";
}) {
  const statsMode = options?.stats ?? "default";
  const commentsMode = options?.comments ?? "default";

  const statsHandlers = [
    http.get("/api/admin/stats/dashboard", () => {
      if (statsMode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        statsMode === "empty" ? emptyDashboardStatsPayload : dashboardStatsPayload,
      );
    }),
    http.get("*/api/admin/stats/dashboard", () => {
      if (statsMode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        statsMode === "empty" ? emptyDashboardStatsPayload : dashboardStatsPayload,
      );
    }),
  ];

  const commentsHandlers = [
    http.get("/api/admin/comments", () => {
      if (commentsMode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        commentsMode === "empty"
          ? {
              ...mockAdminCommentsResponse,
              data: [],
              meta: {
                ...mockAdminCommentsResponse.meta,
                total: 0,
                totalPages: 0,
              },
            }
          : mockAdminCommentsResponse,
      );
    }),
    http.get("*/api/admin/comments", () => {
      if (commentsMode === "error") {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json(
        commentsMode === "empty"
          ? {
              ...mockAdminCommentsResponse,
              data: [],
              meta: {
                ...mockAdminCommentsResponse.meta,
                total: 0,
                totalPages: 0,
              },
            }
          : mockAdminCommentsResponse,
      );
    }),
    http.get("/api/auth/csrf-token", () =>
      HttpResponse.json({ token: "storybook-csrf-token" }),
    ),
    http.get("*/api/auth/csrf-token", () =>
      HttpResponse.json({ token: "storybook-csrf-token" }),
    ),
    http.delete("/api/admin/comments/:id", () => new HttpResponse(null, { status: 204 })),
    http.delete("*/api/admin/comments/:id", () =>
      new HttpResponse(null, { status: 204 }),
    ),
  ];

  return [...statsHandlers, ...commentsHandlers];
}

export const dashboardSuccessHandlers = createDashboardHandlers();
export const dashboardEmptyHandlers = createDashboardHandlers({
  stats: "empty",
  comments: "empty",
});
export const dashboardErrorHandlers = createDashboardHandlers({
  stats: "error",
  comments: "error",
});
