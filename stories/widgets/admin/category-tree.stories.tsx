import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { CategoryManager } from "@features/category-manager";

const meta: Meta<typeof CategoryManager> = {
  title: "Widgets/Manage/CategoryTree",
  component: CategoryManager,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CategoryManager>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/categories", () => {
          return HttpResponse.json({ categories: [] });
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/categories", () => {
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
