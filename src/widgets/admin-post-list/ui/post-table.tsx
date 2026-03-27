"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AdminPostTab } from "./post-filters";
import type { Post } from "@entities/post";
import type { FetchAdminPostsParams } from "@entities/post";
import { cn } from "@shared/lib/style-utils";
import { ConfirmDialog } from "@shared/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@shared/ui/libs";
import { ToggleSwitch } from "@shared/ui/toggle-switch";

export type SortField =
  | "totalPageviews"
  | "commentCount"
  | "created_at"
  | "published_at";
export type SortOrder = "asc" | "desc";

interface PostTableProps {
  tab: AdminPostTab;
  posts: Post[];
  isPending: boolean;
  isError: boolean;
  errorMessage: string;
  selectedIds: number[];
  sort: FetchAdminPostsParams["sort"];
  order: SortOrder;
  onRetry: () => void;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSortChange: (field: SortField) => void;
  onToggleVisibility: (post: Post) => void;
  onTogglePin: (post: Post) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onHardDelete: (id: number) => void;
  pendingToggleIds: Set<number>;
  deleteId: number | null;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value: string | null): string {
  if (!value) return "-";

  return dateFormatter.format(new Date(value));
}

const statusLabelMap: Record<Post["status"], string> = {
  draft: "초안",
  published: "발행",
  archived: "보관",
};

const commentStatusLabelMap: Record<"open" | "locked" | "disabled", string> = {
  open: "열림",
  locked: "잠김",
  disabled: "비활성",
};

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "neutral" | "primary" | "warning" | "danger" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-background-3 text-text-2",
        tone === "primary" && "bg-primary-1/10 text-primary-1",
        tone === "warning" && "bg-positive-1/10 text-positive-1",
        tone === "danger" && "bg-negative-1/10 text-negative-1",
        tone === "info" && "bg-info-1/10 text-info-1",
      )}
    >
      {children}
    </span>
  );
}

function SortableHeader({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
}: {
  label: string;
  field: SortField;
  currentSort: FetchAdminPostsParams["sort"];
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentSort === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-medium hover:text-text-1"
    >
      {label}
      <span
        className={cn("text-xs", isActive ? "text-primary-1" : "text-text-4")}
      >
        {isActive ? (currentOrder === "desc" ? "▼" : "▲") : "↕"}
      </span>
    </button>
  );
}

export function PostTable({
  tab,
  posts,
  isPending,
  isError,
  errorMessage,
  selectedIds,
  sort,
  order,
  onRetry,
  onToggleSelect,
  onToggleSelectAll,
  onSortChange,
  onToggleVisibility,
  onTogglePin,
  onDelete,
  onRestore,
  onHardDelete,
  pendingToggleIds,
  deleteId,
}: PostTableProps) {
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Post | null>(null);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<Post | null>(
    null,
  );
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isHardDeletePending, setIsHardDeletePending] = useState(false);

  const allSelected =
    posts.length > 0 && posts.every((p) => selectedIds.includes(p.id));

  if (isPending) {
    return (
      <div className="overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-2">
        <div className="grid grid-cols-5 gap-4 border-b border-border-3 px-6 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
        <div className="space-y-4 px-6 py-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rect"
              height="2.5rem"
              className="rounded-[1rem]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[1.5rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8 text-center">
        <p className="text-sm text-negative-1">{errorMessage}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        message={
          tab === "trash"
            ? "삭제된 글이 없습니다."
            : "현재 조건에 맞는 글이 없습니다."
        }
      />
    );
  }

  async function handleSingleDelete() {
    if (!singleDeleteTarget) return;
    setIsDeletePending(true);
    try {
      onDelete(singleDeleteTarget.id);
      setSingleDeleteTarget(null);
    } finally {
      setIsDeletePending(false);
    }
  }

  async function handleHardDeleteConfirm() {
    if (!hardDeleteTarget) return;
    setIsHardDeletePending(true);
    try {
      onHardDelete(hardDeleteTarget.id);
      setHardDeleteTarget(null);
    } finally {
      setIsHardDeletePending(false);
    }
  }

  if (tab === "trash") {
    return (
      <>
        <div className="overflow-hidden rounded-[1.5rem] border border-border-3">
          <div className="overflow-x-auto">
            <table
              className="min-w-full bg-background-2"
              aria-label="휴지통 글 목록"
            >
              <thead className="bg-background-1 text-left text-xs uppercase tracking-[0.18em] text-text-4">
                <tr>
                  <th className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onToggleSelectAll}
                      className="h-4 w-4 rounded border-border-3 accent-primary-1"
                      aria-label="전체 선택"
                    />
                  </th>
                  <th className="px-4 py-4 font-medium">제목</th>
                  <th className="px-4 py-4 font-medium">삭제일</th>
                  <th className="px-4 py-4 font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-3">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="align-top hover:bg-background-1/50"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(post.id)}
                        onChange={() => onToggleSelect(post.id)}
                        className="h-4 w-4 rounded border-border-3 accent-primary-1"
                        aria-label={`${post.title} 선택`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-text-1">
                          {post.title}
                        </span>
                        {post.category ? (
                          <span className="text-xs text-text-4">
                            {post.category.name}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-2">
                      {formatDate(post.deletedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onRestore(post.id)}
                          disabled={deleteId === post.id}
                          className="inline-flex items-center rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          복원
                        </button>
                        <button
                          type="button"
                          onClick={() => setHardDeleteTarget(post)}
                          disabled={deleteId === post.id}
                          className="inline-flex items-center rounded-[0.75rem] border border-negative-1/30 px-3 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          영구 삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmDialog
          isOpen={hardDeleteTarget !== null}
          onClose={() => setHardDeleteTarget(null)}
          onConfirm={handleHardDeleteConfirm}
          title={`"${hardDeleteTarget?.title ?? ""}" 글을 영구 삭제합니다.`}
          confirmLabel="영구 삭제"
          confirmTone="danger"
          isPending={isHardDeletePending}
        >
          <div className="space-y-2">
            <p>다음 데이터가 함께 삭제됩니다:</p>
            <ul className="list-disc space-y-1 pl-4 text-text-3">
              {hardDeleteTarget?.commentCount ? (
                <li>댓글 {hardDeleteTarget.commentCount}개</li>
              ) : null}
              <li>조회수 기록</li>
              <li>사용되지 않는 태그</li>
            </ul>
            <p className="font-medium text-negative-1">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </ConfirmDialog>
      </>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[1.5rem] border border-border-3">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-background-2" aria-label="글 목록">
            <thead className="bg-background-1 text-left text-xs uppercase tracking-[0.18em] text-text-4">
              <tr>
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="h-4 w-4 rounded border-border-3 accent-primary-1"
                    aria-label="전체 선택"
                  />
                </th>
                <th className="px-4 py-4 font-medium">고정</th>
                <th className="px-4 py-4 font-medium">제목</th>
                <th className="px-4 py-4 font-medium">상태</th>
                <th className="px-4 py-4 font-medium">공개</th>
                <th className="px-4 py-4 font-medium">
                  <SortableHeader
                    label="조회수"
                    field="totalPageviews"
                    currentSort={sort}
                    currentOrder={order}
                    onSort={onSortChange}
                  />
                </th>
                <th className="px-4 py-4 font-medium">
                  <SortableHeader
                    label="댓글"
                    field="commentCount"
                    currentSort={sort}
                    currentOrder={order}
                    onSort={onSortChange}
                  />
                </th>
                <th className="px-4 py-4 font-medium">댓글 상태</th>
                <th className="px-4 py-4 font-medium">
                  <SortableHeader
                    label="발행일"
                    field="published_at"
                    currentSort={sort}
                    currentOrder={order}
                    onSort={onSortChange}
                  />
                </th>
                <th className="px-4 py-4 font-medium">
                  <SortableHeader
                    label="작성일"
                    field="created_at"
                    currentSort={sort}
                    currentOrder={order}
                    onSort={onSortChange}
                  />
                </th>
                <th className="px-4 py-4 font-medium">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-3">
              {posts.map((post) => {
                const isSelected = selectedIds.includes(post.id);
                const isTogglePending = pendingToggleIds.has(post.id);
                const isActionPending = deleteId === post.id;

                return (
                  <tr
                    key={post.id}
                    className={cn(
                      "align-top hover:bg-background-1/50",
                      isSelected && "bg-primary-1/5",
                    )}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(post.id)}
                        className="h-4 w-4 rounded border-border-3 accent-primary-1"
                        aria-label={`${post.title} 선택`}
                      />
                    </td>

                    {/* Pin toggle */}
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => onTogglePin(post)}
                        disabled={isTogglePending}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          post.isPinned
                            ? "text-primary-1 hover:bg-primary-1/10"
                            : "text-text-4 hover:bg-background-3 hover:text-text-2",
                        )}
                        aria-label={post.isPinned ? "고정 해제" : "글 고정"}
                        title={post.isPinned ? "고정 해제" : "글 고정"}
                      >
                        {post.isPinned ? "📌" : "·"}
                      </button>
                    </td>

                    {/* Title + thumbnail + category */}
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        {post.thumbnailUrl ? (
                          <Image
                            src={post.thumbnailUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded-[0.5rem] object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-[0.5rem] bg-background-3" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-medium text-text-1 line-clamp-1">
                              {post.title}
                            </span>
                            {post.category ? (
                              <Badge tone="neutral">{post.category.name}</Badge>
                            ) : null}
                          </div>
                          {post.summary ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-text-4">
                              {post.summary}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-4">
                      <Badge
                        tone={
                          post.status === "published"
                            ? "primary"
                            : post.status === "draft"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {statusLabelMap[post.status]}
                      </Badge>
                    </td>

                    {/* Visibility toggle */}
                    <td className="px-4 py-4">
                      <ToggleSwitch
                        checked={post.visibility === "public"}
                        disabled={isTogglePending}
                        onChange={() => onToggleVisibility(post)}
                        aria-label={
                          post.visibility === "public" ? "공개" : "비공개"
                        }
                      />
                    </td>

                    {/* Pageviews */}
                    <td className="px-4 py-4 text-sm text-text-2">
                      {post.totalPageviews.toLocaleString()}
                    </td>

                    {/* Comment count */}
                    <td className="px-4 py-4 text-sm text-text-2">
                      {post.commentCount.toLocaleString()}
                    </td>

                    {/* Comment status */}
                    <td className="px-4 py-4">
                      {post.commentStatus ? (
                        <Badge
                          tone={
                            post.commentStatus === "open"
                              ? "primary"
                              : post.commentStatus === "locked"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {commentStatusLabelMap[post.commentStatus]}
                        </Badge>
                      ) : (
                        <span className="text-xs text-text-4">-</span>
                      )}
                    </td>

                    {/* Published at */}
                    <td className="px-4 py-4 text-sm text-text-2">
                      {formatDate(post.publishedAt)}
                    </td>

                    {/* Created at */}
                    <td className="px-4 py-4 text-sm text-text-2">
                      {formatDate(post.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/manage/posts/${post.id}/preview`}
                          className="inline-flex items-center rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
                        >
                          미리보기
                        </Link>
                        <Link
                          href={`/manage/posts/${post.id}/edit`}
                          className="inline-flex items-center rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
                        >
                          수정
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSingleDeleteTarget(post)}
                          disabled={isActionPending}
                          className="inline-flex items-center rounded-[0.75rem] border border-negative-1/30 px-3 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single delete confirm */}
      <ConfirmDialog
        isOpen={singleDeleteTarget !== null}
        onClose={() => setSingleDeleteTarget(null)}
        onConfirm={handleSingleDelete}
        title={`"${singleDeleteTarget?.title ?? ""}" 글을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        confirmTone="danger"
        isPending={isDeletePending}
      >
        <p>삭제된 글은 휴지통에서 복원할 수 있습니다.</p>
      </ConfirmDialog>
    </>
  );
}
