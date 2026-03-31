import type { DashboardStats, PopularPost } from "@entities/stat";

export const mockDashboardStats: DashboardStats = {
  todayPageviews: 142,
  weekPageviews: 1083,
  monthPageviews: 4251,
  totalPosts: 3,
  totalComments: 3,
  postsByStatus: {
    draft: 1,
    published: 2,
    archived: 0,
  },
};

export const mockPopularPosts: PopularPost[] = [
  {
    postId: 1,
    slug: "nextjs-app-router-guide",
    title: "Next.js App Router 완전 가이드",
    pageviews: 1240,
    uniques: 890,
  },
  {
    postId: 2,
    slug: "tailwind-v4-migration",
    title: "Tailwind CSS v4 마이그레이션 후기",
    pageviews: 832,
    uniques: 610,
  },
  {
    postId: 3,
    slug: "typescript-5x-features",
    title: "TypeScript 5.x 새 기능 정리",
    pageviews: 567,
    uniques: 412,
  },
];
