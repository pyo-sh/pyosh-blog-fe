"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { fetchCategoriesAdmin, type Category } from "@entities/category";
import {
  MAX_PINNED_POSTS,
  bulkUpdatePosts,
  deletePost,
  fetchAdminPosts,
  fetchPinnedPostCount,
  hardDeletePost,
  isPinnedPostLimitError,
  restorePost,
  updatePost,
  type BulkPostErrorDetail,
  type FetchAdminPostsParams,
  type Post,
} from "@entities/post";
import { getErrorMessage } from "@shared/lib/get-error-message";
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

const PAGE_SIZE = 10;

function hasBulkDetails(
  err: unknown,
): err is { details: BulkPostErrorDetail[] } {
  return (
    typeof err === "object" &&
    err !== null &&
    "details" in err &&
    Array.isArray((err as { details: unknown }).details)
  );
}

function getQueryKey(
  tab: AdminPostTab,
  page: number,
  status: AdminPostStatusFilter,
  visibility: AdminPostVisibilityFilter,
  categoryId: number | undefined,
  q: string,
  sort: FetchAdminPostsParams["sort"],
  order: SortOrder,
) {
  return [
    "admin-posts",
    tab,
    page,
    status,
    visibility,
    categoryId,
    q,
    sort,
    order,
  ] as const;
}

export default function ManagePostsPage() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<AdminPostTab>("active");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminPostStatusFilter>("all");
  const [visibility, setVisibility] =
    useState<AdminPostVisibilityFilter>("all");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<FetchAdminPostsParams["sort"]>(undefined);
  const [order, setOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pendingToggleIds, setPendingToggleIds] = useState<Set<number>>(
    new Set(),
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryKey = getQueryKey(
    tab,
    page,
    status,
    visibility,
    categoryId,
    searchQuery,
    sort,
    order,
  );

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminPosts({
        page,
        limit: PAGE_SIZE,
        status: status === "all" ? undefined : status,
        visibility: visibility === "all" ? undefined : visibility,
        categoryId,
        q: searchQuery || undefined,
        sort,
        order,
        includeDeleted: tab === "trash",
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-admin"],
    queryFn: (): Promise<Category[]> => fetchCategoriesAdmin(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: pinnedCount } = useQuery({
    queryKey: ["admin-posts", "pinned-count"],
    queryFn: fetchPinnedPostCount,
    staleTime: 30 * 1000,
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const trashCount = tab === "trash" && meta ? meta.total : undefined;

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const resetPage = useCallback(() => {
    setPage(1);
    setSelectedIds([]);
  }, []);

  function handleTabChange(newTab: AdminPostTab) {
    setTab(newTab);
    setPage(1);
    setSelectedIds([]);
    setStatus("all");
    setVisibility("all");
    setCategoryId(undefined);
    setSearchQuery("");
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
    setPage(1);
  }

  function handleToggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleToggleSelectAll() {
    const allIds = rows.map((post) => post.id);
    const everySelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(everySelected ? [] : allIds);
  }

  async function handleToggleVisibility(post: Post) {
    setPendingToggleIds((prev) => new Set(prev).add(post.id));

    const nextVisibility: Post["visibility"] =
      post.visibility === "public" ? "private" : "public";

    queryClient.setQueryData(queryKey, (old: typeof data) => {
      if (!old) return old;

      return {
        ...old,
        data: old.data.map((item) =>
          item.id === post.id ? { ...item, visibility: nextVisibility } : item,
        ),
      };
    });

    try {
      await updatePost(post.id, { visibility: nextVisibility });
    } catch (err) {
      queryClient.setQueryData(queryKey, (old: typeof data) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.map((item) =>
            item.id === post.id
              ? { ...item, visibility: post.visibility }
              : item,
          ),
        };
      });
      toast.error(getErrorMessage(err, "공개 여부 변경에 실패했습니다."));
    } finally {
      setPendingToggleIds((prev) => {
        const next = new Set(prev);
        next.delete(post.id);

        return next;
      });
    }
  }

  async function handleTogglePin(post: Post) {
    setPendingToggleIds((prev) => new Set(prev).add(post.id));

    try {
      const nextPinned = !post.isPinned;

      if (
        nextPinned &&
        typeof pinnedCount === "number" &&
        pinnedCount >= MAX_PINNED_POSTS
      ) {
        toast.error(
          `고정 글은 최대 ${MAX_PINNED_POSTS}개까지 설정할 수 있습니다.`,
        );

        return;
      }

      queryClient.setQueryData(queryKey, (old: typeof data) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.map((item) =>
            item.id === post.id ? { ...item, isPinned: nextPinned } : item,
          ),
        };
      });

      await updatePost(post.id, { isPinned: nextPinned });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
        queryClient.invalidateQueries({
          queryKey: ["admin-posts", "pinned-count"],
        }),
      ]);
    } catch (err) {
      queryClient.setQueryData(queryKey, (old: typeof data) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.map((item) =>
            item.id === post.id ? { ...item, isPinned: post.isPinned } : item,
          ),
        };
      });

      if (isPinnedPostLimitError(err)) {
        toast.error(
          `고정 글은 최대 ${MAX_PINNED_POSTS}개까지 설정할 수 있습니다.`,
        );
      } else {
        toast.error(getErrorMessage(err, "고정 변경에 실패했습니다."));
      }
    } finally {
      setPendingToggleIds((prev) => {
        const next = new Set(prev);
        next.delete(post.id);

        return next;
      });
    }
  }

  async function invalidatePostQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
      queryClient.invalidateQueries({
        queryKey: ["admin-posts", "pinned-count"],
      }),
    ]);
  }

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onMutate: (id) => setDeleteId(id),
    onSuccess: async () => {
      await invalidatePostQueries();
      toast.success("글이 삭제되었습니다.");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "글 삭제에 실패했습니다."));
    },
    onSettled: () => setDeleteId(null),
  });

  const restoreMutation = useMutation({
    mutationFn: restorePost,
    onMutate: (id) => setDeleteId(id),
    onSuccess: async () => {
      await invalidatePostQueries();
      toast.success("글이 복원되었습니다.");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "글 복원에 실패했습니다."));
    },
    onSettled: () => setDeleteId(null),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeletePost,
    onMutate: (id) => setDeleteId(id),
    onSuccess: async () => {
      await invalidatePostQueries();
      toast.success("글이 영구 삭제되었습니다.");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "영구 삭제에 실패했습니다."));
    },
    onSettled: () => setDeleteId(null),
  });

  async function handleBulkDelete(ids: number[]) {
    try {
      await bulkUpdatePosts({ ids, action: "soft_delete" });
      await invalidatePostQueries();
      toast.success(`${ids.length}개 글이 삭제되었습니다.`);
    } catch (err) {
      if (hasBulkDetails(err) && err.details.length) {
        const detail = err.details
          .map((item) => `#${item.id}: ${item.reason}`)
          .join(", ");
        toast.error(`삭제 실패: ${detail}`);
      } else {
        toast.error(getErrorMessage(err, "일괄 삭제에 실패했습니다."));
      }
      throw err;
    }
  }

  async function handleBulkRestore(ids: number[]) {
    try {
      await bulkUpdatePosts({ ids, action: "restore" });
      await invalidatePostQueries();
      toast.success(`${ids.length}개 글이 복원되었습니다.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "일괄 복원에 실패했습니다."));
      throw err;
    }
  }

  async function handleBulkHardDelete(ids: number[]) {
    try {
      await bulkUpdatePosts({ ids, action: "hard_delete" });
      await invalidatePostQueries();
      toast.success(`${ids.length}개 글이 영구 삭제되었습니다.`);
    } catch (err) {
      if (hasBulkDetails(err) && err.details.length) {
        const detail = err.details
          .map((item) => `#${item.id}: ${item.reason}`)
          .join(", ");
        toast.error(`영구 삭제 실패: ${detail}`);
      } else {
        toast.error(getErrorMessage(err, "일괄 영구 삭제에 실패했습니다."));
      }
      throw err;
    }
  }

  async function handleBulkUpdate(
    ids: number[],
    nextCategoryId?: number,
    commentStatus?: "open" | "locked" | "disabled",
  ) {
    try {
      await bulkUpdatePosts({
        ids,
        action: "update",
        categoryId: nextCategoryId,
        commentStatus,
      });
      await invalidatePostQueries();
      toast.success(`${ids.length}개 글이 업데이트되었습니다.`);
    } catch (err) {
      if (hasBulkDetails(err) && err.details.length) {
        const detail = err.details
          .map((item) => `#${item.id}: ${item.reason}`)
          .join(", ");
        toast.error(`업데이트 실패: ${detail}`);
      } else {
        toast.error(getErrorMessage(err, "일괄 업데이트에 실패했습니다."));
      }
      throw err;
    }
  }

  const paginationLabel = useMemo(() => {
    if (!meta || rows.length === 0) return "표시할 글이 없습니다.";
    const start = (meta.page - 1) * meta.limit + 1;
    const end = start + rows.length - 1;

    return `총 ${meta.total}개 중 ${start}-${end}`;
  }, [meta, rows.length]);

  const allSelected =
    rows.length > 0 && rows.every((post) => selectedIds.includes(post.id));

  return (
    <div className="space-y-4">
      <PostFilters
        tab={tab}
        trashCount={trashCount}
        status={status}
        visibility={visibility}
        categoryId={categoryId}
        categories={categories}
        searchQuery={searchQuery}
        onTabChange={handleTabChange}
        onStatusChange={(value) => {
          setStatus(value);
          resetPage();
        }}
        onVisibilityChange={(value) => {
          setVisibility(value);
          resetPage();
        }}
        onCategoryChange={(value) => {
          setCategoryId(value);
          resetPage();
        }}
        onSearch={(value) => {
          setSearchQuery(value);
          resetPage();
        }}
        action={
          <Link
            href="/manage/posts/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary-1 px-4 py-2.5 text-body-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            새 글 작성
          </Link>
        }
      />

      {selectedIds.length > 0 ? (
        <BulkActions
          tab={tab}
          selectedIds={selectedIds}
          allSelected={allSelected}
          categories={categories}
          onSelectAll={handleToggleSelectAll}
          onBulkDelete={handleBulkDelete}
          onBulkRestore={handleBulkRestore}
          onBulkHardDelete={handleBulkHardDelete}
          onBulkUpdate={handleBulkUpdate}
          onClearSelection={() => setSelectedIds([])}
        />
      ) : null}

      <PostTable
        tab={tab}
        posts={rows}
        isPending={isPending}
        isError={isError}
        errorMessage={getErrorMessage(error, "글 목록을 불러오지 못했습니다.")}
        selectedIds={selectedIds}
        sort={sort}
        order={order}
        onRetry={() => void refetch()}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onSortChange={handleSortChange}
        onToggleVisibility={handleToggleVisibility}
        onTogglePin={handleTogglePin}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        onRestore={(id) => restoreMutation.mutate(id)}
        onHardDelete={(id) => hardDeleteMutation.mutateAsync(id)}
        pendingToggleIds={pendingToggleIds}
        deleteId={deleteId}
      />

      <div className="flex flex-col gap-4 border-t border-border-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-text-4">
          {isFetching && !isPending
            ? "목록을 새로 불러오는 중..."
            : paginationLabel}
        </p>

        {meta && meta.totalPages > 1 ? (
          <nav
            aria-label="관리자 글 페이지네이션"
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page === 1}
              className="inline-flex rounded-lg border border-border-3 px-3 py-2 text-body-sm text-text-2 transition-colors hover:bg-background-3 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              이전
            </button>

            <span className="min-w-20 text-center text-body-sm text-text-2">
              {page} / {meta.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((value) => Math.min(meta.totalPages, value + 1))
              }
              disabled={page === meta.totalPages}
              className="inline-flex rounded-lg border border-border-3 px-3 py-2 text-body-sm text-text-2 transition-colors hover:bg-background-3 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
