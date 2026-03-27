import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { DashboardHome } from "@widgets/dashboard";

const meta: Meta<typeof DashboardHome> = {
  title: "Widgets/Admin/Dashboard",
  component: DashboardHome,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DashboardHome>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/stats/dashboard", () => {
          return HttpResponse.json({
            todayPageviews: 0,
            weekPageviews: 0,
            monthPageviews: 0,
            totalPosts: 0,
            totalComments: 0,
          });
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/stats/dashboard", () => {
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
