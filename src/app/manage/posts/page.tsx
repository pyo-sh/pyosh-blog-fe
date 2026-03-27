"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { fetchCategoriesAdmin, type Category } from "@entities/category";
import {
  bulkUpdatePosts,
  deletePost,
  fetchAdminPosts,
  hardDeletePost,
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

function getQueryKey(
  tab: AdminPostTab,
  page: number,
  status: AdminPostStatusFilter,
  visibility: AdminPostVisibilityFilter,
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

  const rows = data?.data ?? [];
  const meta = data?.meta;

  // Trash tab meta total — shown only after loading to avoid displaying a stale
  // count. The badge is intentionally omitted until the backend exposes a
  // deleted-only count endpoint, since includeDeleted=true may be additive.
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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleToggleSelectAll() {
    const allIds = rows.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  }

  async function handleToggleVisibility(post: Post) {
    setPendingToggleIds((prev) => new Set(prev).add(post.id));

    const nextVisibility: Post["visibility"] =
      post.visibility === "public" ? "private" : "public";

    queryClient.setQueryData(queryKey, (old: typeof data) => {
      if (!old) return old;

      return {
        ...old,
        data: old.data.map((p) =>
          p.id === post.id ? { ...p, visibility: nextVisibility } : p,
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
          data: old.data.map((p) =>
            p.id === post.id ? { ...p, visibility: post.visibility } : p,
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

    const nextPinned = !post.isPinned;

    queryClient.setQueryData(queryKey, (old: typeof data) => {
      if (!old) return old;

      return {
        ...old,
        data: old.data.map((p) =>
          p.id === post.id ? { ...p, isPinned: nextPinned } : p,
        ),
      };
    });

    try {
      await updatePost(post.id, { isPinned: nextPinned });
    } catch (err) {
      queryClient.setQueryData(queryKey, (old: typeof data) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.map((p) =>
            p.id === post.id ? { ...p, isPinned: post.isPinned } : p,
          ),
        };
      });
      toast.error(getErrorMessage(err, "고정 변경에 실패했습니다."));
    } finally {
      setPendingToggleIds((prev) => {
        const next = new Set(prev);
        next.delete(post.id);

        return next;
      });
    }
  }

  async function invalidatePostQueries() {
    await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
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
      const apiErr = err as { details?: BulkPostErrorDetail[] };
      if (apiErr.details?.length) {
        const detail = apiErr.details
          .map((d) => `#${d.id}: ${d.reason}`)
          .join(", ");
        toast.error(`삭제 실패: ${detail}`);
      } else {
        toast.error(getErrorMessage(err, "일괄 삭제에 실패했습니다."));
      }
    }
  }

  async function handleBulkRestore(ids: number[]) {
    try {
      await bulkUpdatePosts({ ids, action: "restore" });
      await invalidatePostQueries();
      toast.success(`${ids.length}개 글이 복원되었습니다.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "일괄 복원에 실패했습니다."));
    }
  }

  async function handleBulkHardDelete(ids: number[]) {
    try {
      await bulkUpdatePosts({ ids, action: "hard_delete" });
      await invalidatePostQueries();
      toast.success(`${ids.length}개 글이 영구 삭제되었습니다.`);
    } catch (err) {
      const apiErr = err as { details?: BulkPostErrorDetail[] };
      if (apiErr.details?.length) {
        const detail = apiErr.details
          .map((d) => `#${d.id}: ${d.reason}`)
          .join(", ");
        toast.error(`영구 삭제 실패: ${detail}`);
      } else {
        toast.error(getErrorMessage(err, "일괄 영구 삭제에 실패했습니다."));
      }
    }
  }

  async function handleBulkUpdate(
    ids: number[],
    categoryId?: number,
    commentStatus?: "open" | "locked" | "disabled",
  ) {
    try {
      await bulkUpdatePosts({
        ids,
        action: "update",
        categoryId,
        commentStatus,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success(`${ids.length}개 글이 업데이트되었습니다.`);
    } catch (err) {
      const apiErr = err as { details?: BulkPostErrorDetail[] };
      if (apiErr.details?.length) {
        const detail = apiErr.details
          .map((d) => `#${d.id}: ${d.reason}`)
          .join(", ");
        toast.error(`업데이트 실패: ${detail}`);
      } else {
        toast.error(getErrorMessage(err, "일괄 업데이트에 실패했습니다."));
      }
    }
  }

  const paginationLabel = useMemo(() => {
    if (!meta || rows.length === 0) return "표시할 글이 없습니다.";
    const start = (meta.page - 1) * meta.limit + 1;
    const end = start + rows.length - 1;

    return `총 ${meta.total}개 중 ${start}-${end}`;
  }, [meta, rows.length]);

  const allSelected =
    rows.length > 0 && rows.every((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Content
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-text-1">글 관리</h1>
          <p className="mt-2 text-sm text-text-3">
            상태별 글을 조회하고 새 글 작성, 수정, 삭제 또는 복원을 진행할 수
            있습니다.
          </p>
        </div>

        <Link
          href="/manage/posts/new"
          className="inline-flex items-center justify-center rounded-[0.9rem] bg-primary-1 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          새 글 작성
        </Link>
      </header>

      <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <PostFilters
            tab={tab}
            trashCount={trashCount}
            status={status}
            visibility={visibility}
            searchQuery={searchQuery}
            onTabChange={handleTabChange}
            onStatusChange={(v) => {
              setStatus(v);
              resetPage();
            }}
            onVisibilityChange={(v) => {
              setVisibility(v);
              resetPage();
            }}
            onSearch={(q) => {
              setSearchQuery(q);
              resetPage();
            }}
          />

          <p className="shrink-0 text-sm text-text-4">
            {isFetching && !isPending
              ? "목록을 새로 불러오는 중..."
              : paginationLabel}
          </p>
        </div>

        {selectedIds.length > 0 ? (
          <div className="mt-4">
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
          </div>
        ) : null}

        <div className="mt-4">
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
            onRestore={(id) => restoreMutation.mutate(id)}
            onHardDelete={(id) => hardDeleteMutation.mutateAsync(id)}
            pendingToggleIds={pendingToggleIds}
            deleteId={deleteId}
          />
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-4 border-t border-border-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-4">{paginationLabel}</p>

            <nav
              aria-label="관리자 글 페이지네이션"
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setPage((v) => Math.max(1, v - 1))}
                disabled={page === 1}
                className="inline-flex rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>

              <span className="min-w-20 text-center text-sm text-text-2">
                {page} / {meta.totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((v) => Math.min(meta.totalPages, v + 1))}
                disabled={page === meta.totalPages}
                className="inline-flex rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </nav>
          </div>
        ) : null}
      </section>
    </div>
  );
}
