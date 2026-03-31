import type { Meta, StoryObj } from "@storybook/react";
import { DashboardHome } from "@widgets/dashboard";
import {
  dashboardEmptyHandlers,
  dashboardErrorHandlers,
  dashboardSuccessHandlers,
} from "../../mocks/dashboard-handlers";

const meta: Meta<typeof DashboardHome> = {
  title: "Widgets/Admin/Dashboard",
  component: DashboardHome,
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: dashboardSuccessHandlers,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardHome>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: dashboardEmptyHandlers,
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: dashboardErrorHandlers,
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
