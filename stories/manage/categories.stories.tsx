import type { Meta, StoryObj } from "@storybook/react";
import ManageCategoriesPage from "@app/manage/categories/page";
import {
  ManageCanvasFrame,
  ManageMobileFrame,
  ManagePageFrame,
} from "./_manage-story-frames";
import { createManageCategoriesHandlers } from "../mocks/manage-page-handlers";

const meta: Meta<typeof ManageCategoriesPage> = {
  title: "Manage/Categories",
  component: ManageCategoriesPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/manage/categories",
        query: {},
      },
    },
    msw: {
      handlers: createManageCategoriesHandlers(),
    },
  },
};

export default meta;

type Story = StoryObj<typeof ManageCategoriesPage>;

export const Default: Story = {
  render: () => (
    <ManagePageFrame>
      <ManageCategoriesPage />
    </ManagePageFrame>
  ),
};

export const CanvasOnly: Story = {
  render: () => (
    <ManageCanvasFrame>
      <ManageCategoriesPage />
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
        <ManageCategoriesPage />
      </ManagePageFrame>
    </ManageMobileFrame>
  ),
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: createManageCategoriesHandlers({ mode: "empty" }),
    },
  },
  render: () => (
    <ManagePageFrame>
      <ManageCategoriesPage />
    </ManagePageFrame>
  ),
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: createManageCategoriesHandlers({ mode: "error" }),
    },
  },
  render: () => (
    <ManagePageFrame>
      <ManageCategoriesPage />
    </ManagePageFrame>
  ),
};
