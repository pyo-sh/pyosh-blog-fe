import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { Category } from "@entities/category";
import { CategoryDeleteModal } from "@features/category-manager/ui/category-delete-modal";

const demoCategories: Category[] = [
  {
    id: 1,
    parentId: null,
    name: "개발",
    slug: "dev",
    sortOrder: 1,
    isVisible: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    totalPostCount: 0,
    publishedPostCount: 0,
    children: [
      {
        id: 2,
        parentId: 1,
        name: "Frontend",
        slug: "frontend",
        sortOrder: 1,
        isVisible: true,
        createdAt: "2026-03-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
        totalPostCount: 4,
        publishedPostCount: 3,
        children: [],
      },
      {
        id: 3,
        parentId: 1,
        name: "Backend",
        slug: "backend",
        sortOrder: 2,
        isVisible: true,
        createdAt: "2026-03-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
        totalPostCount: 2,
        publishedPostCount: 2,
        children: [],
      },
    ],
  },
  {
    id: 4,
    parentId: null,
    name: "DevOps",
    slug: "devops",
    sortOrder: 2,
    isVisible: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    totalPostCount: 0,
    publishedPostCount: 0,
    children: [],
  },
];

function StoryModal({
  category,
  isDeleting = false,
}: {
  category: Category;
  isDeleting?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <CategoryDeleteModal
      category={open ? category : null}
      categories={demoCategories}
      isDeleting={isDeleting}
      onCancel={() => setOpen(false)}
      onConfirm={() => undefined}
    />
  );
}

const meta: Meta<typeof StoryModal> = {
  title: "Features/CategoryDeleteModal",
  component: StoryModal,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof StoryModal>;

export const SimpleConfirm: Story = {
  args: {
    category: demoCategories[1],
  },
};

export const WithPosts: Story = {
  args: {
    category: {
      ...demoCategories[0].children![1],
      totalPostCount: 5,
      publishedPostCount: 5,
    },
  },
};

export const BlockedByChildren: Story = {
  args: {
    category: demoCategories[0],
  },
};
