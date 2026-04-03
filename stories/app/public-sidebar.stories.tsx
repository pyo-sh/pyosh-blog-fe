import type { Meta, StoryObj } from "@storybook/react";
import {
  PublicSidebarContent,
  PublicSidebarPanel,
} from "@widgets/public-sidebar";
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

function DesktopSidebarStory(args: React.ComponentProps<typeof PublicSidebarContent>) {
  return (
    <div className="bg-background-1 px-6">
      <div className="w-[17.5rem] pr-6 pt-8 pb-16">
        <PublicSidebarContent {...args} />
      </div>
    </div>
  );
}

function MobileSidebarStory(args: React.ComponentProps<typeof PublicSidebarPanel>) {
  return (
    <div className="bg-black/5 p-4">
      <div className="w-[min(320px,85vw)] overflow-hidden rounded-none bg-background-1 shadow-[-4px_0_24px_rgba(0,0,0,0.1)]">
        <PublicSidebarPanel {...args} />
      </div>
    </div>
  );
}

const meta: Meta<typeof PublicSidebarContent> = {
  title: "Widgets/Public/Sidebar",
  component: PublicSidebarContent,
  parameters: {
    layout: "fullscreen",
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

export const Desktop: Story = {
  render: (args) => <DesktopSidebarStory {...args} />,
};

export const MobilePanel: Story = {
  render: (args) => (
    <MobileSidebarStory {...args} onClose={() => undefined} />
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const NoCategories: Story = {
  render: (args) => <DesktopSidebarStory {...args} />,
  args: {
    categories: [],
  },
};

export const NoTags: Story = {
  render: (args) => <DesktopSidebarStory {...args} />,
  args: {
    tags: [],
  },
};

export const Empty: Story = {
  render: (args) => <DesktopSidebarStory {...args} />,
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
  render: (args) => <DesktopSidebarStory {...args} />,
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
