import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "@widgets/footer";

const meta: Meta<typeof Footer> = {
  title: "Widgets/Public/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

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
