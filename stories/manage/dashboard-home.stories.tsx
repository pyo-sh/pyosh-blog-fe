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

function DashboardCanvasFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-1 px-4 py-6 md:px-6">
      <div className="mx-auto w-full max-w-[72rem] rounded-[1.5rem] border border-border-4 bg-background-1/80 p-4 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)] md:p-6">
        {children}
      </div>
    </div>
  );
}

function DashboardMobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-1 px-4 py-6">
      <div className="mx-auto w-full max-w-[24.5rem] overflow-hidden rounded-[1.5rem] border border-border-4 bg-background-1 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.08)]">
        {children}
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <ManageLayoutShell>
      <DashboardHome />
    </ManageLayoutShell>
  ),
};

export const CanvasOnly: Story = {
  render: () => (
    <DashboardCanvasFrame>
      <DashboardHome />
    </DashboardCanvasFrame>
  ),
};

export const Mobile: Story = {
  render: () => (
    <DashboardMobileFrame>
      <ManageLayoutShell>
        <DashboardHome />
      </ManageLayoutShell>
    </DashboardMobileFrame>
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
