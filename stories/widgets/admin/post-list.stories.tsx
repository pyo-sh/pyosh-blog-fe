import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { mockCategories } from "../../mocks/data/categories";
import { mockPosts } from "../../mocks/data/posts";
import type { Post } from "@entities/post";
import {
  BulkActions,
  PostFilters,
  PostTable,
  type AdminPostStatusFilter,
  type AdminPostTab,
  type AdminPostVisibilityFilter,
  type SortField,
  type SortOrder,
} from "@widgets/admin-post-list";

interface AdminPostListStoryProps {
  initialTab: AdminPostTab;
  initiallySelectedIds?: number[];
}

function AdminPostListStory({
  initialTab,
  initiallySelectedIds = [],
}: AdminPostListStoryProps) {
  const [tab, setTab] = useState<AdminPostTab>(initialTab);
  const [status, setStatus] = useState<AdminPostStatusFilter>("all");
  const [visibility, setVisibility] = useState<AdminPostVisibilityFilter>("all");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>(initiallySelectedIds);
  const [sort, setSort] = useState<SortField | undefined>(undefined);
  const [order, setOrder] = useState<SortOrder>("desc");
  const [activePosts, setActivePosts] = useState<Post[]>(
    mockPosts.map((post, index) => ({
      ...post,
      commentStatus: index % 3 === 0 ? "open" : index % 3 === 1 ? "locked" : "disabled",
    })),
  );
  const [trashPosts, setTrashPosts] = useState<Post[]>([
    {
      ...mockPosts[1],
      id: 99,
      title: "휴지통에 있는 글",
      deletedAt: "2026-03-20T12:00:00.000Z",
      visibility: "private",
      isPinned: false,
    },
  ]);

  const posts = tab === "trash" ? trashPosts : activePosts;
  const allSelected =
    posts.length > 0 && posts.every((post) => selectedIds.includes(post.id));

  function toggleSelection(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : posts.map((post) => post.id));
  }

  function resetListForTab(nextTab: AdminPostTab) {
    setTab(nextTab);
    setSelectedIds([]);
    setSearchQuery("");
    setStatus("all");
    setVisibility("all");
    setCategoryId(undefined);
  }

  function handleSortChange(field: SortField) {
    if (sort === field) {
      if (order === "desc") {
        setOrder("asc");
      } else {
        setSort(undefined);
        setOrder("desc");
      }
    } else {
      setSort(field);
      setOrder("desc");
    }
  }

  return (
    <div className="space-y-4 p-4">
      <PostFilters
        tab={tab}
        trashCount={trashPosts.length}
        status={status}
        visibility={visibility}
        categoryId={categoryId}
        categories={mockCategories}
        searchQuery={searchQuery}
        onTabChange={resetListForTab}
        onStatusChange={setStatus}
        onVisibilityChange={setVisibility}
        onCategoryChange={setCategoryId}
        onSearch={setSearchQuery}
      />

      {selectedIds.length > 0 ? (
        <BulkActions
          tab={tab}
          selectedIds={selectedIds}
          allSelected={allSelected}
          categories={mockCategories}
          onSelectAll={toggleAll}
          onBulkDelete={async (ids) => {
            setTrashPosts((current) => [
              ...current,
              ...activePosts
                .filter((post) => ids.includes(post.id))
                .map((post) => ({
                  ...post,
                  deletedAt: "2026-03-28T00:00:00.000Z",
                  isPinned: false,
                })),
            ]);
            setActivePosts((current) =>
              current.filter((post) => !ids.includes(post.id)),
            );
          }}
          onBulkRestore={async (ids) => {
            setActivePosts((current) => [
              ...current,
              ...trashPosts
                .filter((post) => ids.includes(post.id))
                .map((post) => ({ ...post, deletedAt: null })),
            ]);
            setTrashPosts((current) =>
              current.filter((post) => !ids.includes(post.id)),
            );
          }}
          onBulkHardDelete={async (ids) => {
            setTrashPosts((current) =>
              current.filter((post) => !ids.includes(post.id)),
            );
          }}
          onBulkUpdate={async (ids, categoryId, commentStatus) => {
            setActivePosts((current) =>
              current.map((post) => {
                if (!ids.includes(post.id)) {
                  return post;
                }

                const category = categoryId
                  ? mockCategories.find((item) => item.id === categoryId) ??
                    post.category
                  : post.category;

                return {
                  ...post,
                  categoryId: category.id,
                  category: {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                  },
                  commentStatus: commentStatus ?? post.commentStatus,
                };
              }),
            );
          }}
          onClearSelection={() => setSelectedIds([])}
        />
      ) : null}

      <PostTable
        tab={tab}
        posts={posts}
        isPending={false}
        isError={false}
        errorMessage=""
        selectedIds={selectedIds}
        sort={sort}
        order={order}
        onRetry={() => undefined}
        onToggleSelect={toggleSelection}
        onToggleSelectAll={toggleAll}
        onSortChange={handleSortChange}
        onToggleVisibility={(post) => {
          setActivePosts((current) =>
            current.map((item) =>
              item.id === post.id
                ? {
                    ...item,
                    visibility:
                      item.visibility === "public" ? "private" : "public",
                  }
                : item,
            ),
          );
        }}
        onTogglePin={(post) => {
          setActivePosts((current) =>
            current.map((item) =>
              item.id === post.id ? { ...item, isPinned: !item.isPinned } : item,
            ),
          );
        }}
        onDelete={async (id) => {
          const target = activePosts.find((post) => post.id === id);

          if (!target) {
            return;
          }

          setActivePosts((current) => current.filter((post) => post.id !== id));
          setTrashPosts((current) => [
            ...current,
            { ...target, deletedAt: "2026-03-28T00:00:00.000Z", isPinned: false },
          ]);
        }}
        onRestore={(id) => {
          const target = trashPosts.find((post) => post.id === id);

          if (!target) {
            return;
          }

          setTrashPosts((current) => current.filter((post) => post.id !== id));
          setActivePosts((current) => [
            ...current,
            { ...target, deletedAt: null },
          ]);
        }}
        onHardDelete={async (id) => {
          setTrashPosts((current) => current.filter((post) => post.id !== id));
        }}
        pendingToggleIds={new Set()}
        deleteId={null}
      />
    </div>
  );
}

const meta: Meta<typeof AdminPostListStory> = {
  title: "Widgets/PostList",
  component: AdminPostListStory,
  parameters: {
    layout: "padded",
  },
  args: {
    initialTab: "active",
    initiallySelectedIds: [1, 2],
  },
};

export default meta;
type Story = StoryObj<typeof AdminPostListStory>;

export const Default: Story = {};

export const Trash: Story = {
  args: {
    initialTab: "trash",
    initiallySelectedIds: [99],
  },
};

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
