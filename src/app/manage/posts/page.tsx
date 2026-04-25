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
  type PostListItem,
} from "@entities/post";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { Modal, Spinner } from "@shared/ui/libs";
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
const UNCATEGORIZED_LABEL = "(카테고리 없음)";

interface RestoreSelection {
  ids: number[];
  orphanIds: number[];
}

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

function flattenCategories(
  categories: Category[],
  depth = 0,
): Array<{ id: number; name: string; depth: number }> {
  return categories.flatMap((category) => [
    { id: category.id, name: category.name, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
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
  const [restoreSelection, setRestoreSelection] =
    useState<RestoreSelection | null>(null);
  const [restoreCategoryId, setRestoreCategoryId] = useState<number | null>(
    null,
  );
  const [isRestoreCategoryPending, setIsRestoreCategoryPending] =
    useState(false);

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
  const flatCategories = useMemo(
    () => flattenCategories(categories),
    [categories],
  );

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

  async function handleToggleVisibility(post: PostListItem) {
    setPendingToggleIds((prev) => new Set(prev).add(post.id));

    const nextVisibility: PostListItem["visibility"] =
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

  async function handleTogglePin(post: PostListItem) {
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

  function getRestoreSelection(posts: PostListItem[]): RestoreSelection {
    return {
      ids: posts.map((post) => post.id),
      orphanIds: posts
        .filter((post) => post.categoryId === null)
        .map((post) => post.id),
    };
  }

  function closeRestoreModal() {
    if (isRestoreCategoryPending) {
      return;
    }

    setRestoreSelection(null);
    setRestoreCategoryId(null);
  }

  async function restorePosts({
    ids,
    orphanIds,
    categoryId,
  }: RestoreSelection & { categoryId?: number }) {
    if (orphanIds.length > 0) {
      const nextCategoryId = categoryId ?? restoreCategoryId;

      if (nextCategoryId === null || nextCategoryId === undefined) {
        throw new Error("카테고리를 선택해 주세요.");
      }

      await Promise.all(
        orphanIds.map((id) => updatePost(id, { categoryId: nextCategoryId })),
      );
    }

    if (ids.length === 1) {
      await restorePost(ids[0]);

      return;
    }

    await bulkUpdatePosts({ ids, action: "restore" });
  }

  async function handleSingleRestore(post: PostListItem) {
    const nextSelection = getRestoreSelection([post]);

    if (nextSelection.orphanIds.length > 0) {
      setRestoreSelection(nextSelection);
      setRestoreCategoryId(null);

      return;
    }

    try {
      setDeleteId(post.id);
      await restorePosts(nextSelection);
      await invalidatePostQueries();
      toast.success("글이 복원되었습니다.");
    } catch (err) {
      toast.error(getErrorMessage(err, "글 복원에 실패했습니다."));
    } finally {
      setDeleteId(null);
    }
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
    const selectedPosts = rows.filter((post) => ids.includes(post.id));
    const nextSelection = getRestoreSelection(selectedPosts);

    try {
      if (nextSelection.orphanIds.length > 0) {
        setRestoreSelection(nextSelection);
        setRestoreCategoryId(null);

        return;
      }

      await restorePosts(nextSelection);
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
  const restoreTargetCount = restoreSelection?.ids.length ?? 0;
  const orphanRestoreCount = restoreSelection?.orphanIds.length ?? 0;

  return (
    <>
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
          errorMessage={getErrorMessage(
            error,
            "글 목록을 불러오지 못했습니다.",
          )}
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
          onRestore={(id) => {
            const post = rows.find((item) => item.id === id);

            if (!post) {
              toast.error("복원할 글 정보를 찾지 못했습니다.");

              return;
            }

            void handleSingleRestore(post);
          }}
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

      <Modal
        isOpen={restoreSelection !== null}
        onClose={closeRestoreModal}
        withBackground
        aria-label="복원 카테고리 선택"
      >
        <div className="w-full max-w-xl rounded-[1.5rem] bg-background-1 p-6 text-left">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-text-4">
              Restore
            </p>
            <h2 className="text-xl font-semibold text-text-1">
              카테고리를 다시 지정한 뒤 복원합니다.
            </h2>
            <p className="text-sm leading-6 text-text-3">
              선택한 {restoreTargetCount}개 글 중 {orphanRestoreCount}개는
              카테고리가 없습니다. 복원 전에 새 카테고리를 지정해야 합니다.
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <label
              htmlFor="restore-category"
              className="block text-sm font-medium text-text-2"
            >
              복원할 카테고리
            </label>
            <select
              id="restore-category"
              value={restoreCategoryId ?? ""}
              onChange={(event) =>
                setRestoreCategoryId(
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              disabled={isRestoreCategoryPending}
              className="w-full rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {UNCATEGORIZED_LABEL} 글의 카테고리를 선택하세요
              </option>
              {flatCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {`${"— ".repeat(category.depth)}${category.name}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-4">
              선택한 카테고리가 카테고리 없는 글에 일괄 적용된 뒤 복원이
              진행됩니다.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeRestoreModal}
              disabled={isRestoreCategoryPending}
              className="rounded-[0.9rem] border border-border-3 px-4 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              disabled={
                isRestoreCategoryPending ||
                restoreSelection === null ||
                restoreCategoryId === null
              }
              onClick={async () => {
                if (!restoreSelection || restoreCategoryId === null) {
                  return;
                }

                setDeleteId(restoreSelection.ids[0] ?? null);
                setIsRestoreCategoryPending(true);

                try {
                  await restorePosts({
                    ...restoreSelection,
                    categoryId: restoreCategoryId,
                  });
                  await invalidatePostQueries();
                  toast.success(
                    restoreSelection.ids.length === 1
                      ? "글이 복원되었습니다."
                      : `${restoreSelection.ids.length}개 글이 복원되었습니다.`,
                  );
                  setRestoreSelection(null);
                  setRestoreCategoryId(null);
                  setSelectedIds((current) =>
                    current.filter((id) => !restoreSelection.ids.includes(id)),
                  );
                } catch (err) {
                  toast.error(
                    getErrorMessage(
                      err,
                      "카테고리를 다시 지정한 뒤 복원하지 못했습니다.",
                    ),
                  );
                } finally {
                  setIsRestoreCategoryPending(false);
                  setDeleteId(null);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-[0.9rem] bg-primary-1 px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRestoreCategoryPending ? <Spinner size="sm" /> : null}
              복원
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
