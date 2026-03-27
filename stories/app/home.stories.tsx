import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { PostList } from "@features/post-list";
import { mockPosts, mockMeta } from "../mocks/data/posts";

const defaultInitialData = { data: mockPosts, meta: mockMeta };

const meta: Meta<typeof PostList> = {
  title: "App/Home",
  component: PostList,
  parameters: {
    layout: "padded",
  },
  args: {
    initialData: defaultInitialData,
    initialPage: 1,
  },
};

export default meta;
type Story = StoryObj<typeof PostList>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initialData: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } },
    initialPage: 1,
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/posts", () => {
          return HttpResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
        }),
      ],
    },
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
