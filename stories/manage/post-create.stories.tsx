import type { Meta, StoryObj } from "@storybook/react";
import { ManageLayoutShell } from "@app/manage/layout-shell";
import ManagePostCreatePage from "@app/manage/posts/new/page";
import { postCreateHandlers } from "../mocks/post-create-handlers";

const meta: Meta<typeof ManagePostCreatePage> = {
  title: "Manage/PostCreate",
  component: ManagePostCreatePage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/manage/posts/new",
        query: {},
      },
    },
    msw: {
      handlers: postCreateHandlers,
    },
  },
};

export default meta;

type Story = StoryObj<typeof ManagePostCreatePage>;

function CreateCanvasFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-1 px-4 py-6 md:px-6">
      <div className="mx-auto w-full max-w-[72rem] rounded-[1.5rem] border border-border-4 bg-background-1/80 p-4 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)] md:p-6">
        {children}
      </div>
    </div>
  );
}

function CreateMobileFrame({ children }: { children: React.ReactNode }) {
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
      <ManagePostCreatePage />
    </ManageLayoutShell>
  ),
};

export const CanvasOnly: Story = {
  render: () => (
    <CreateCanvasFrame>
      <ManagePostCreatePage />
    </CreateCanvasFrame>
  ),
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
  },
  render: () => (
    <CreateMobileFrame>
      <ManageLayoutShell>
        <ManagePostCreatePage />
      </ManageLayoutShell>
    </CreateMobileFrame>
  ),
};
