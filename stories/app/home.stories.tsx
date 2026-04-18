import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { PostList } from "@features/post-list";
import { mockPosts, mockMeta } from "../mocks/data/posts";

const defaultInitialData = { data: mockPosts, meta: mockMeta };

function HomeStoryFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-[67.5rem] flex-col gap-6 px-4 pb-16 pt-8 md:px-6">
      <header className="mb-4">
        <h1 className="break-keep text-[1.5rem] leading-[1.938rem] font-bold tracking-tight text-text-1 md:text-[1.875rem] md:leading-[2.375rem]">
          최근 글
        </h1>
      </header>
      {children}
    </main>
  );
}

const meta: Meta<typeof PostList> = {
  title: "App/Home",
  component: PostList,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    initialData: defaultInitialData,
    initialPage: 1,
  },
};

export default meta;
type Story = StoryObj<typeof PostList>;

export const Default: Story = {
  render: (args) => (
    <HomeStoryFrame>
      <PostList {...args} />
    </HomeStoryFrame>
  ),
};

export const Empty: Story = {
  render: (args) => (
    <HomeStoryFrame>
      <PostList {...args} />
    </HomeStoryFrame>
  ),
  args: {
    initialData: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } },
    initialPage: 1,
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/posts", () => {
          return HttpResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
        }),
      ],
    },
  },
};

export const Mobile: Story = {
  render: (args) => (
    <HomeStoryFrame>
      <PostList {...args} />
    </HomeStoryFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const DarkMode: Story = {
  render: (args) => (
    <HomeStoryFrame>
      <PostList {...args} />
    </HomeStoryFrame>
  ),
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
