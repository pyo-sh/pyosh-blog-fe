import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "@widgets/header";

const meta: Meta<typeof Header> = {
  title: "Widgets/Public/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
        query: {},
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const SearchPage: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/search",
        query: {
          q: "nextjs",
          filter: "title_content",
        },
      },
    },
  },
};
