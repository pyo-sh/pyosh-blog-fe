import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { PopularPostList } from "@features/popular-posts";

const defaultPosts = [
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
    uniques: 612,
  },
  {
    postId: 3,
    slug: "typescript-5x-features",
    title: "TypeScript 5.x 새 기능 정리",
    pageviews: 567,
    uniques: 420,
  },
  {
    postId: 4,
    slug: "react-query-patterns",
    title: "TanStack Query 패턴 정리",
    pageviews: 412,
    uniques: 305,
  },
  {
    postId: 5,
    slug: "storybook-msw",
    title: "Storybook + MSW 실전 설정",
    pageviews: 355,
    uniques: 244,
  },
] as const;

const lastMonthPosts = [
  {
    postId: 6,
    slug: "next15-upgrade",
    title: "Next.js 15 업그레이드 체크리스트",
    pageviews: 2210,
    uniques: 1430,
  },
  {
    postId: 7,
    slug: "tailwind-v4",
    title: "Tailwind CSS v4 토큰 전략",
    pageviews: 1870,
    uniques: 1202,
  },
] as const;

const popularHandlers = [
  http.get("/api/stats/popular", ({ request }) => {
    const days = new URL(request.url).searchParams.get("days");
    return HttpResponse.json({
      data: days === "30" ? lastMonthPosts : defaultPosts,
    });
  }),
  http.get("http://localhost:5500/api/stats/popular", ({ request }) => {
    const days = new URL(request.url).searchParams.get("days");
    return HttpResponse.json({
      data: days === "30" ? lastMonthPosts : defaultPosts,
    });
  }),
];

const meta: Meta<typeof PopularPostList> = {
  title: "Features/PopularPostList",
  component: PopularPostList,
  parameters: {
    layout: "padded",
    msw: {
      handlers: popularHandlers,
    },
  },
  args: {
    initialPosts: [...defaultPosts],
  },
};

export default meta;
type Story = StoryObj<typeof PopularPostList>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initialPosts: [],
  },
};

export const InitialLoadError: Story = {
  args: {
    initialPosts: null,
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
