import type { Meta, StoryObj } from "@storybook/react";
import { AdminHeaderActions } from "@widgets/admin-sidebar";

function AdminHeaderStory() {
  return (
    <div className="flex min-h-14 items-center border-b border-border-4 bg-background-1 px-6">
      <AdminHeaderActions />
    </div>
  );
}

const meta: Meta<typeof AdminHeaderStory> = {
  title: "Widgets/Admin/Header",
  component: AdminHeaderStory,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AdminHeaderStory>;

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
