import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { mockPosts, mockMeta } from "../../mocks/data/posts";

// The admin post list is implemented as a page component.
// This story wraps the PostList feature used in the public home page
// to demonstrate the list UI with mock data.
import { PostList } from "@features/post-list";

const meta: Meta<typeof PostList> = {
  title: "Widgets/Admin/PostList",
  component: PostList,
  parameters: {
    layout: "padded",
  },
  args: {
    initialData: { data: mockPosts, meta: mockMeta },
    initialPage: 1,
    basePath: "/manage/posts",
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
        http.get("/api/admin/posts", () => {
          return HttpResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
        }),
      ],
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
