import Link from "next/link";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { Category } from "@entities/category";
import { getCategoryAncestors } from "@entities/category";
import { PostListItem } from "@features/post-list";
import { EmptyState, Pagination } from "@shared/ui/libs";
import { mockCategories } from "../mocks/data/categories";
import { mockPosts } from "../mocks/data/posts";

interface CategoryPostsPreviewProps {
  categories: Category[];
  activeCategoryId: number;
  totalCount: number;
  posts: typeof mockPosts;
  currentPage: number;
  totalPages: number;
}

function CategoryPostsPreview({
  categories,
  activeCategoryId,
  totalCount,
  posts,
  currentPage,
  totalPages,
}: CategoryPostsPreviewProps) {
  const activeCategory = findCategory(categories, activeCategoryId);

  if (!activeCategory) {
    return null;
  }

  const ancestors = getCategoryAncestors(categories, activeCategory.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-8 px-4 py-12 md:px-6">
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Category Archive
        </p>
        {ancestors.length > 0 ? (
          <nav
            aria-label="카테고리 경로"
            className="mt-3 flex flex-wrap items-center gap-1 text-body-xs text-text-4"
          >
            {ancestors.map((ancestor, index) => (
              <StoryBreadcrumbItem
                key={ancestor.id}
                href={`/categories/${ancestor.slug}`}
                showSeparator={index > 0}
              >
                {ancestor.name}
              </StoryBreadcrumbItem>
            ))}
            <span aria-hidden="true">{">"}</span>
            <span className="text-text-3">{activeCategory.name}</span>
          </nav>
        ) : null}
        <h1 className="mt-3 text-heading-md text-text-1">{activeCategory.name}</h1>
        <p className="mt-4 text-body-md text-text-3">
          총 {totalCount.toLocaleString("ko-KR")}개의 글이 이 카테고리에 등록되어
          있습니다.
        </p>
      </header>

      {posts.length > 0 ? (
        <section className="grid gap-5">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <EmptyState
          variant="page"
          message="아직 이 카테고리에 등록된 공개 글이 없습니다."
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/categories/${activeCategory.slug}`}
      />
    </main>
  );
}

function findCategory(
  categories: Category[],
  targetId: number,
): Category | undefined {
  for (const category of categories) {
    if (category.id === targetId) {
      return category;
    }

    const child = findCategory(category.children ?? [], targetId);

    if (child) {
      return child;
    }
  }

  return undefined;
}

function StoryBreadcrumbItem({
  href,
  showSeparator,
  children,
}: {
  href: string;
  showSeparator: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {showSeparator ? <span aria-hidden="true">{">"}</span> : null}
      <Link href={href} className="transition-colors hover:text-text-2">
        {children}
      </Link>
    </>
  );
}

const meta: Meta<typeof CategoryPostsPreview> = {
  title: "App/CategoryPosts",
  component: CategoryPostsPreview,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    categories: mockCategories,
    activeCategoryId: 3,
    totalCount: 12,
    posts: mockPosts,
    currentPage: 1,
    totalPages: 1,
  },
};

export default meta;
type Story = StoryObj<typeof CategoryPostsPreview>;

export const Default: Story = {};

export const TopLevelCategory: Story = {
  args: {
    activeCategoryId: 1,
  },
};

export const WithPagination: Story = {
  args: {
    totalCount: 30,
    currentPage: 2,
    totalPages: 4,
  },
};

export const Empty: Story = {
  args: {
    totalCount: 0,
    posts: [],
    totalPages: 0,
  },
};

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
