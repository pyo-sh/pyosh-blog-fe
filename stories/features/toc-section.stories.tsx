import type { Meta, StoryObj } from "@storybook/react";
import { TocSection } from "@features/toc";

const headings = [
  { id: "intro", text: "소개", level: 1 as const },
  { id: "background", text: "배경", level: 1 as const },
  { id: "implementation", text: "구현", level: 1 as const },
  { id: "setup", text: "설정", level: 2 as const },
  { id: "code", text: "코드", level: 2 as const },
  { id: "details", text: "상세 코드", level: 3 as const },
  { id: "conclusion", text: "결론", level: 1 as const },
];

const meta: Meta<typeof TocSection> = {
  title: "Features/TocSection",
  component: TocSection,
  parameters: {
    layout: "padded",
  },
  args: {
    headings,
  },
};

export default meta;
type Story = StoryObj<typeof TocSection>;

export const Desktop: Story = {};

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
