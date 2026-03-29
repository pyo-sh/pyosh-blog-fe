import type { Meta, StoryObj } from "@storybook/react";
import { PostListItem } from "@features/post-list";
import { mockPosts } from "../mocks/data/posts";

const meta: Meta<typeof PostListItem> = {
  title: "Features/PostListItem",
  component: PostListItem,
  parameters: {
    layout: "padded",
  },
  args: {
    post: mockPosts[0],
  },
};

export default meta;
type Story = StoryObj<typeof PostListItem>;

export const WithThumbnail: Story = {};

export const WithoutThumbnail: Story = {
  args: {
    post: {
      ...mockPosts[1],
      thumbnailUrl: null,
    },
  },
};

export const Comparison: Story = {
  render: () => (
    <div className="grid max-w-4xl gap-3">
      <PostListItem post={mockPosts[0]} />
      <PostListItem
        post={{
          ...mockPosts[1],
          thumbnailUrl: null,
        }}
      />
    </div>
  ),
};

export const ZeroViews: Story = {
  args: {
    post: {
      ...mockPosts[2],
      totalPageviews: 0,
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
