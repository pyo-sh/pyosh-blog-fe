import type { Meta, StoryObj } from "@storybook/react";
import ManageGuestbookPage from "@app/manage/guestbook/page";
import {
  ManageCanvasFrame,
  ManageMobileFrame,
  ManagePageFrame,
} from "./_manage-story-frames";
import { createManageGuestbookHandlers } from "../mocks/manage-page-handlers";

const meta: Meta<typeof ManageGuestbookPage> = {
  title: "Manage/Guestbook",
  component: ManageGuestbookPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/manage/guestbook",
        query: {},
      },
    },
    msw: {
      handlers: createManageGuestbookHandlers(),
    },
  },
};

export default meta;

type Story = StoryObj<typeof ManageGuestbookPage>;

export const Default: Story = {
  render: () => (
    <ManagePageFrame>
      <ManageGuestbookPage />
    </ManagePageFrame>
  ),
};

export const CanvasOnly: Story = {
  render: () => (
    <ManageCanvasFrame>
      <ManageGuestbookPage />
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
        <ManageGuestbookPage />
      </ManagePageFrame>
    </ManageMobileFrame>
  ),
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: createManageGuestbookHandlers({ mode: "empty" }),
    },
  },
  render: () => (
    <ManagePageFrame>
      <ManageGuestbookPage />
    </ManagePageFrame>
  ),
};

export const Disabled: Story = {
  parameters: {
    msw: {
      handlers: createManageGuestbookHandlers({ mode: "disabled" }),
    },
  },
  render: () => (
    <ManagePageFrame>
      <ManageGuestbookPage />
    </ManagePageFrame>
  ),
};
