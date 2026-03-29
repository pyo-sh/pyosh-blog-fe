import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@iconify/react";
import tagLinear from "@iconify-icons/solar/tag-linear";
import { PostListItem } from "@features/post-list";
import { ArchiveHeader, EmptyState, Pagination } from "@shared/ui/libs";
import { mockPosts } from "../mocks/data/posts";
import { mockActiveTag } from "../mocks/data/tags";

interface TagPostsPreviewProps {
  tagName: string;
  totalCount: number;
  posts: typeof mockPosts;
  currentPage: number;
  totalPages: number;
}

function TagPostsPreview({
  tagName,
  totalCount,
  posts,
  currentPage,
  totalPages,
}: TagPostsPreviewProps) {
  return (
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      <ArchiveHeader variant="tag" title={tagName} count={totalCount} />

      {posts.length > 0 ? (
        <section className="grid gap-5">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <EmptyState
          variant="page"
          icon={
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-3">
              <Icon
                icon={tagLinear}
                width="28"
                aria-hidden="true"
                className="text-text-4"
              />
            </div>
          }
          title="아직 이 태그에 연결된 공개 글이 없습니다."
          description="곧 새로운 글로 찾아올게요."
        />
      )}

      <div className="mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/tags/${tagName.toLowerCase()}`}
        />
      </div>
    </main>
  );
}

const meta: Meta<typeof TagPostsPreview> = {
  title: "App/TagPosts",
  component: TagPostsPreview,
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
    tagName: mockActiveTag.name,
    totalCount: mockActiveTag.postCount,
    posts: mockPosts,
    currentPage: 1,
    totalPages: 1,
  },
};

export default meta;
type Story = StoryObj<typeof TagPostsPreview>;

export const Default: Story = {};

export const WithPagination: Story = {
  args: {
    totalCount: 30,
    currentPage: 2,
    totalPages: 3,
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
