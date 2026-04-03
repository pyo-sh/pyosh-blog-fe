import type { Meta, StoryObj } from "@storybook/react";
import ManageCommentsPage from "@app/manage/comments/page";
import {
  ManageCanvasFrame,
  ManageMobileFrame,
  ManagePageFrame,
} from "./_manage-story-frames";
import { createManageCommentsHandlers } from "../mocks/manage-page-handlers";

const meta: Meta<typeof ManageCommentsPage> = {
  title: "Manage/Comments",
  component: ManageCommentsPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/manage/comments",
        query: {},
      },
    },
    msw: {
      handlers: createManageCommentsHandlers(),
    },
  },
};

export default meta;

type Story = StoryObj<typeof ManageCommentsPage>;

export const Default: Story = {
  render: () => (
    <ManagePageFrame>
      <ManageCommentsPage />
    </ManagePageFrame>
  ),
};

export const CanvasOnly: Story = {
  render: () => (
    <ManageCanvasFrame>
      <ManageCommentsPage />
    </ManageCanvasFrame>
  ),
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
  },
  render: () => (
    <ManageMobileFrame>
      <ManagePageFrame>
        <ManageCommentsPage />
      </ManagePageFrame>
    </ManageMobileFrame>
  ),
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: createManageCommentsHandlers({ mode: "empty" }),
    },
  },
  render: () => (
    <ManagePageFrame>
      <ManageCommentsPage />
    </ManagePageFrame>
  ),
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: createManageCommentsHandlers({ mode: "error" }),
    },
  },
  render: () => (
    <ManagePageFrame>
      <ManageCommentsPage />
    </ManagePageFrame>
  ),
};
