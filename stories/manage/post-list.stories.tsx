import type { Meta, StoryObj } from "@storybook/react";
import { ManageLayoutShell } from "@app/manage/layout-shell";
import ManagePostsPage from "@app/manage/posts/page";
import {
  postListEmptyHandlers,
  postListErrorHandlers,
  postListHandlers,
} from "../mocks/post-list-handlers";

const meta: Meta<typeof ManagePostsPage> = {
  title: "Manage/PostList",
  component: ManagePostsPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/manage/posts",
        query: {},
      },
    },
    msw: {
      handlers: postListHandlers,
    },
  },
};

export default meta;

type Story = StoryObj<typeof ManagePostsPage>;

function PostListCanvasFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-1 px-4 py-6 md:px-6">
      <div className="mx-auto w-full max-w-[72rem] rounded-[1.5rem] border border-border-4 bg-background-1/80 p-4 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)] md:p-6">
        {children}
      </div>
    </div>
  );
}

function PostListMobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-1 px-4 py-6">
      <div className="mx-auto w-full max-w-[24.5rem] overflow-hidden rounded-[1.5rem] border border-border-4 bg-background-1 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.08)]">
        <div className="relative min-h-[52rem] overflow-hidden [transform:translateZ(0)] [&_.min-h-screen]:min-h-[52rem]">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <ManageLayoutShell>
      <ManagePostsPage />
    </ManageLayoutShell>
  ),
};

export const CanvasOnly: Story = {
  render: () => (
    <PostListCanvasFrame>
      <ManagePostsPage />
    </PostListCanvasFrame>
  ),
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
  },
  render: () => (
    <PostListMobileFrame>
      <ManageLayoutShell>
        <ManagePostsPage />
      </ManageLayoutShell>
    </PostListMobileFrame>
  ),
};

export const Empty: Story = {
  render: () => (
    <ManageLayoutShell>
      <ManagePostsPage />
    </ManageLayoutShell>
  ),
  parameters: {
    msw: {
      handlers: postListEmptyHandlers,
    },
  },
};

export const Error: Story = {
  render: () => (
    <ManageLayoutShell>
      <ManagePostsPage />
    </ManageLayoutShell>
  ),
  parameters: {
    msw: {
      handlers: postListErrorHandlers,
    },
  },
};
