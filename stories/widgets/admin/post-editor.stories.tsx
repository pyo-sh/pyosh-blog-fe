import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { PostForm } from "@features/post-editor";

const meta: Meta<typeof PostForm> = {
  title: "Widgets/Manage/PostEditor",
  component: PostForm,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof PostForm>;

export const Create: Story = {
  args: {
    mode: "create",
  },
};

export const Edit: Story = {
  args: {
    mode: "edit",
    postId: 1,
    initialValues: {
      title: "Next.js App Router 완전 가이드",
      contentMd: "# Next.js App Router\n\nApp Router는 React Server Components를 기반으로 합니다.",
      categoryId: 1,
      visibility: "public",
      status: "published",
    },
  },
};

export const Error: Story = {
  args: {
    mode: "create",
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/categories", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
};

export const DarkMode: Story = {
  args: {
    mode: "create",
  },
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
