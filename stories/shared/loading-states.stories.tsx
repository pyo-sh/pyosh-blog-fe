import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "@shared/ui/libs";

const meta: Meta<typeof Skeleton> = {
  title: "Shared/LoadingStates",
  component: Skeleton,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: "h-8 w-full",
  },
};

export const DarkMode: Story = {
  args: {
    className: "h-8 w-full",
  },
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
