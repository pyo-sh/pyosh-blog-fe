import type { Meta, StoryObj } from "@storybook/react";
import ManageAssetsPage from "@app/manage/assets/page";
import {
  ManageCanvasFrame,
  ManageMobileFrame,
  ManagePageFrame,
} from "./_manage-story-frames";
import { createManageAssetsHandlers } from "../mocks/manage-page-handlers";

const meta: Meta<typeof ManageAssetsPage> = {
  title: "Manage/Assets",
  component: ManageAssetsPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/manage/assets",
        query: {},
      },
    },
    msw: {
      handlers: createManageAssetsHandlers(),
    },
  },
};

export default meta;

type Story = StoryObj<typeof ManageAssetsPage>;

export const Default: Story = {
  render: () => (
    <ManagePageFrame>
      <ManageAssetsPage />
    </ManagePageFrame>
  ),
};

export const CanvasOnly: Story = {
  render: () => (
    <ManageCanvasFrame>
      <ManageAssetsPage />
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
        <ManageAssetsPage />
      </ManagePageFrame>
    </ManageMobileFrame>
  ),
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: createManageAssetsHandlers({ mode: "empty" }),
    },
  },
  render: () => (
    <ManagePageFrame>
      <ManageAssetsPage />
    </ManagePageFrame>
  ),
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: createManageAssetsHandlers({ mode: "error" }),
    },
  },
  render: () => (
    <ManagePageFrame>
      <ManageAssetsPage />
    </ManagePageFrame>
  ),
};
