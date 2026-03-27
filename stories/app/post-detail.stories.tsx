import type { Meta, StoryObj } from "@storybook/react";
import { RelatedPosts } from "@features/post-detail";
import { mockPosts } from "../mocks/data/posts";

const meta: Meta<typeof RelatedPosts> = {
  title: "App/PostDetail/RelatedPosts",
  component: RelatedPosts,
  parameters: {
    layout: "padded",
  },
  args: {
    posts: mockPosts,
  },
};

export default meta;
type Story = StoryObj<typeof RelatedPosts>;

export const Default: Story = {};

export const WithThumbnails: Story = {
  args: {
    posts: mockPosts.map((p) => ({
      ...p,
      thumbnailUrl: "https://placehold.co/180x113/1e293b/94a3b8?text=thumb",
    })),
  },
};

export const SinglePost: Story = {
  args: {
    posts: mockPosts.slice(0, 1),
  },
};

export const Empty: Story = {
  args: {
    posts: [],
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
