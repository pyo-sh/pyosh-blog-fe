import type { Meta, StoryObj } from "@storybook/react";
import {
  OverviewCategoryTree,
  SidebarCategoryTree,
} from "@features/category-tree";
import type { Category } from "@entities/category";
import { mockCategories } from "../mocks/data/categories";

interface CategoryTreeStoryArgs {
  categories: Category[];
  initialExpandedSlugs?: string[];
}

const meta: Meta<CategoryTreeStoryArgs> = {
  title: "Features/Public/CategoryTree",
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
type Story = StoryObj<CategoryTreeStoryArgs>;

export const Sidebar: Story = {
  render: (args) => <SidebarCategoryTree {...args} />,
  args: {
    initialExpandedSlugs: ["dev", "frontend"],
  },
};

export const Overview: Story = {
  render: (args) => <OverviewCategoryTree categories={args.categories} />,
};
