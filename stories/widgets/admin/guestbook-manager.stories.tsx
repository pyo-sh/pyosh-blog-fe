import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { GuestbookManager } from "@features/guestbook-manager";

const meta: Meta<typeof GuestbookManager> = {
  title: "Widgets/Manage/GuestbookManager",
  component: GuestbookManager,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof GuestbookManager>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/guestbook", () => {
          return HttpResponse.json({
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
          });
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

export const Disabled: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/settings/guestbook", () => {
          return HttpResponse.json({ enabled: false });
        }),
      ],
    },
  },
};
