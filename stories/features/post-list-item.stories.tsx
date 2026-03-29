import type { Meta, StoryObj } from "@storybook/react";
import { PostListItem } from "@features/post-list";
import { mockPosts } from "../mocks/data/posts";

const meta: Meta<typeof PostListItem> = {
  title: "Features/PostListItem",
  component: PostListItem,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    post: mockPosts[0],
  },
};

export default meta;
type Story = StoryObj<typeof PostListItem>;

export const WithThumbnail: Story = {};

export const WithoutThumbnail: Story = {
  render: (args) => (
    <div className="mx-auto max-w-4xl">
      <PostListItem {...args} />
    </div>
  ),
  args: {
    post: {
      ...mockPosts[1],
      thumbnailUrl: null,
    },
  },
};

export const Comparison: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-ui-xs uppercase tracking-[0.24em] text-text-4">
          Wireframe Match
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-text-1 md:text-3xl">
          Post List Item
        </h1>
        <p className="mt-2 text-sm text-text-3">
          썸네일이 있는 경우와 없는 경우를 실제 퍼블릭 배경 위에서 비교합니다.
        </p>
      </div>

      <div className="grid gap-3">
        <PostListItem post={mockPosts[0]} />
        <PostListItem
          post={{
            ...mockPosts[1],
            thumbnailUrl: null,
          }}
        />
      </div>
    </div>
  ),
};

export const ZeroViews: Story = {
  render: (args) => (
    <div className="mx-auto max-w-4xl">
      <PostListItem {...args} />
    </div>
  ),
  args: {
    post: {
      ...mockPosts[2],
      totalPageviews: 0,
    },
  },
};

export const DarkMode: Story = {
  render: (args) => (
    <div className="mx-auto max-w-4xl">
      <PostListItem {...args} />
    </div>
  ),
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
