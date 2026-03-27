import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { GuestbookPageContent } from "@features/guestbook-form";
import { mockGuestbookEntries } from "../mocks/data/guestbook";

const defaultMeta = { total: mockGuestbookEntries.length, page: 1, limit: 10, totalPages: 1 };
const guestViewer = { type: "guest" as const };

const meta: Meta<typeof GuestbookPageContent> = {
  title: "App/Guestbook",
  component: GuestbookPageContent,
  parameters: {
    layout: "padded",
  },
  args: {
    initialEntries: mockGuestbookEntries,
    initialMeta: defaultMeta,
    viewer: guestViewer,
  },
};

export default meta;
type Story = StoryObj<typeof GuestbookPageContent>;

export const Default: Story = {};

export const LoggedIn: Story = {
  args: {
    viewer: { type: "oauth", id: 1 },
  },
};

export const Empty: Story = {
  args: {
    initialEntries: [],
    initialMeta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/guestbook", () => {
          return HttpResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
        }),
      ],
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
