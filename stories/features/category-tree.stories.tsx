import type { Meta, StoryObj } from "@storybook/react";
import { CategoryTree } from "@features/category-tree";
import { mockCategories } from "../mocks/data/categories";

const meta: Meta<typeof CategoryTree> = {
  title: "Features/Public/CategoryTree",
  component: CategoryTree,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex min-h-screen w-full max-w-[38rem] items-start bg-background-1 px-4 py-8 md:px-6">
        <div className="w-full">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    categories: mockCategories,
  },
};

export default meta;
type Story = StoryObj<typeof CategoryTree>;

export const Sidebar: Story = {
  args: {
    initialExpandedSlugs: ["dev", "frontend"],
  },
};

export const Overview: Story = {
  args: {
    showOverviewLink: false,
    variant: "overview",
  },
};
