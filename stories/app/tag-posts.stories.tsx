import type { Meta, StoryObj } from "@storybook/react";
import { PostListItem } from "@features/post-list";
import { EmptyState, Pagination } from "@shared/ui/libs";
import { mockPosts, mockMeta } from "../mocks/data/posts";
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
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-8 px-4 py-12 md:px-6">
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Tag Archive
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">#{tagName}</h1>
        <p className="mt-4 text-body-md text-text-3">
          총 {totalCount.toLocaleString("ko-KR")}개의 글이 이 태그와 연결되어
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
          message="아직 이 태그에 연결된 공개 글이 없습니다."
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/tags/${tagName.toLowerCase()}`}
      />
    </main>
  );
}

const meta: Meta<typeof TagPostsPreview> = {
  title: "App/TagPosts",
  component: TagPostsPreview,
  parameters: {
    layout: "fullscreen",
  },
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
