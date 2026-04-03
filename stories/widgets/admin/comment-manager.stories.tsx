import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { AdminCommentsPage } from "@widgets/admin-comments";

const meta: Meta<typeof AdminCommentsPage> = {
  title: "Widgets/Manage/CommentManager",
  component: AdminCommentsPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AdminCommentsPage>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/comments", () => {
          return HttpResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/comments", () => {
          return new HttpResponse(null, { status: 500 });
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
