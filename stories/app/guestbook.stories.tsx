import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { GuestbookPageContent } from "@features/guestbook-form";
import { mockGuestbookEntries } from "../mocks/data/guestbook";

const defaultMeta = {
  total: 42,
  page: 1,
  limit: 10,
  totalPages: 5,
};

const meta: Meta<typeof GuestbookPageContent> = {
  title: "App/Guestbook",
  component: GuestbookPageContent,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/guestbook",
        query: {},
      },
    },
  },
  args: {
    initialEntries: mockGuestbookEntries,
    initialMeta: defaultMeta,
    viewer: { type: "guest" as const },
  },
};

export default meta;
type Story = StoryObj<typeof GuestbookPageContent>;

export const GuestView: Story = {};

export const LoggedInView: Story = {
  args: {
    viewer: { type: "oauth", id: 1 },
  },
};

export const AuthFallback: Story = {
  args: {
    viewer: {
      type: "guest",
      authErrorMessage:
        "로그인 상태를 확인하지 못해 게스트 모드로 표시합니다. 잠시 후 다시 시도해 주세요.",
    },
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
        http.get("/api/guestbook", () =>
          HttpResponse.json({
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
          }),
        ),
      ],
    },
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[23.4375rem] px-4 py-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: "mobile" },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/guestbook",
        query: {},
      },
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/guestbook",
        query: {},
      },
    },
  },
};
