import type { Meta, StoryObj } from "@storybook/react";
import { PublicSidebarContent } from "@widgets/public-sidebar";
import { mockPosts } from "../mocks/data/posts";
import { mockTags } from "../mocks/data/tags";
import { mockCategories } from "../mocks/data/categories";

const mockPopularPosts = [
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
];

const mockTotalViews = { totalPageviews: 12345 };
const mockHeadings = [
  { id: "intro", text: "소개", level: 1 as const },
  { id: "setup", text: "설정", level: 2 as const },
  { id: "details", text: "상세 코드", level: 3 as const },
];

const meta: Meta<typeof PublicSidebarContent> = {
  title: "App/PublicSidebar",
  component: PublicSidebarContent,
  parameters: {
    layout: "padded",
  },
  args: {
    recentPosts: mockPosts,
    popularPosts: mockPopularPosts,
    categories: mockCategories,
    tags: mockTags,
    totalViews: mockTotalViews,
    headings: mockHeadings,
  },
};

export default meta;
type Story = StoryObj<typeof PublicSidebarContent>;

export const Default: Story = {};

export const NoCategories: Story = {
  args: {
    categories: [],
  },
};

export const NoTags: Story = {
  args: {
    tags: [],
  },
};

export const Empty: Story = {
  args: {
    recentPosts: [],
    popularPosts: [],
    categories: [],
    tags: [],
    totalViews: null,
    headings: [],
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
