import type { Meta, StoryObj } from "@storybook/react";
import { AdminSidebar } from "@widgets/admin-sidebar";

const meta: Meta<typeof AdminSidebar> = {
  title: "Widgets/Admin/Sidebar",
  component: AdminSidebar,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isOpen: true,
  },
};

export default meta;
type Story = StoryObj<typeof AdminSidebar>;

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
