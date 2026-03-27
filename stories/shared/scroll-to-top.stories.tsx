import type { Meta, StoryObj } from "@storybook/react";
import { ScrollToTop } from "@shared/ui/libs";

const meta: Meta<typeof ScrollToTop> = {
  title: "Shared/ScrollToTop",
  component: ScrollToTop,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ScrollToTop>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
