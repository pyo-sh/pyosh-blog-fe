import type { Category } from "@entities/category";

export const mockCategories: Category[] = [
  {
    id: 1,
    parentId: null,
    name: "개발",
    slug: "dev",
    sortOrder: 1,
    isVisible: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    children: [
      {
        id: 3,
        parentId: 1,
        name: "프론트엔드",
        slug: "frontend",
        sortOrder: 1,
        isVisible: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        children: [],
      },
      {
        id: 4,
        parentId: 1,
        name: "백엔드",
        slug: "backend",
        sortOrder: 2,
        isVisible: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        children: [],
      },
    ],
  },
  {
    id: 2,
    parentId: null,
    name: "회고",
    slug: "retrospect",
    sortOrder: 2,
    isVisible: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    children: [],
  },
];
