import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@iconify/react";
import documentTextLinear from "@iconify-icons/solar/document-text-linear";
import type { Category } from "@entities/category";
import { getCategoryAncestors } from "@entities/category";
import { PostListItem } from "@features/post-list";
import { ArchiveHeader, EmptyState, Pagination } from "@shared/ui/libs";
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
  const breadcrumbLinks =
    ancestors.length > 0
      ? [
          ...ancestors.map((ancestor) => ({
            label: ancestor.name,
            href: `/categories/${ancestor.slug}`,
          })),
          { label: activeCategory.name },
        ]
      : undefined;

  return (
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      <ArchiveHeader
        variant="category"
        title={activeCategory.name}
        count={totalCount}
        breadcrumbs={breadcrumbLinks}
      />

      {posts.length > 0 ? (
        <section className="grid gap-5">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <EmptyState
          variant="page"
          className="shadow-none"
          icon={
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-3">
              <Icon
                icon={documentTextLinear}
                width="28"
                aria-hidden="true"
                className="text-text-4"
              />
            </div>
          }
          title="아직 이 카테고리에 등록된 공개 글이 없습니다."
          description="곧 새로운 글로 찾아올게요."
        />
      )}

      <div className="mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/categories/${activeCategory.slug}`}
        />
      </div>
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
const meta: Meta<typeof CategoryPostsPreview> = {
  title: "App/CategoryPosts",
  component: CategoryPostsPreview,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[51rem] px-4 py-8 md:px-6">
        <Story />
      </div>
    ),
  ],
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
