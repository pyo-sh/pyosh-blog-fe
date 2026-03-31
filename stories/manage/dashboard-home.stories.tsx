import type { Meta, StoryObj } from "@storybook/react";
import { ManageLayoutShell } from "@app/manage/layout-shell";
import { DashboardHome } from "@widgets/dashboard";
import {
  dashboardEmptyHandlers,
  dashboardErrorHandlers,
  dashboardSuccessHandlers,
} from "../mocks/dashboard-handlers";

const meta: Meta<typeof DashboardHome> = {
  title: "Manage/DashboardHome",
  component: DashboardHome,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/manage",
        query: {},
      },
    },
    msw: {
      handlers: dashboardSuccessHandlers,
    },
  },
};

export default meta;

type Story = StoryObj<typeof DashboardHome>;

export const DashboardOnly: Story = {
  render: () => (
    <div className="min-h-screen bg-background-1 px-4 py-6 md:px-6">
      <DashboardHome />
    </div>
  ),
};

export const InAdminShell: Story = {
  render: () => (
    <ManageLayoutShell>
      <DashboardHome />
    </ManageLayoutShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <ManageLayoutShell>
      <DashboardHome />
    </ManageLayoutShell>
  ),
  parameters: {
    msw: {
      handlers: dashboardEmptyHandlers,
    },
  },
};

export const Error: Story = {
  render: () => (
    <ManageLayoutShell>
      <DashboardHome />
    </ManageLayoutShell>
  ),
  parameters: {
    msw: {
      handlers: dashboardErrorHandlers,
    },
  },
};
