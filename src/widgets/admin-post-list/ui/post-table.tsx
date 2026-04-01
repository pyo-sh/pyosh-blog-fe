"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import altArrowDownLinear from "@iconify-icons/solar/alt-arrow-down-linear";
import altArrowUpLinear from "@iconify-icons/solar/alt-arrow-up-linear";
import sortLinear from "@iconify-icons/solar/sort-linear";
import chatRoundDotsLinear from "@iconify-icons/solar/chat-round-dots-linear";
import eyeLinear from "@iconify-icons/solar/eye-linear";
import pinBold from "@iconify-icons/solar/pin-bold";
import pinLinear from "@iconify-icons/solar/pin-linear";
import trashBinMinimalisticLinear from "@iconify-icons/solar/trash-bin-minimalistic-linear";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminPostTab } from "./post-filters";
import type { FetchAdminPostsParams, Post } from "@entities/post";
import { cn } from "@shared/lib/style-utils";
import { ConfirmDialog } from "@shared/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@shared/ui/libs";

export type SortField = NonNullable<FetchAdminPostsParams["sort"]>;
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
  onDelete: (id: number) => Promise<void>;
  onRestore: (id: number) => void;
  onHardDelete: (id: number) => Promise<void>;
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
  draft: "작성",
  published: "발행",
  archived: "보관",
};

const visibilityLabelMap: Record<Post["visibility"], string> = {
  public: "공개",
  private: "비공개",
};

const commentStatusLabelMap: Record<"open" | "locked" | "disabled", string> = {
  open: "열림",
  locked: "잠김",
  disabled: "닫힘",
};

function Badge({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone:
    | "category"
    | "published"
    | "draft"
    | "archived"
    | "comment-open"
    | "comment-locked"
    | "comment-disabled";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium leading-4 whitespace-nowrap",
        tone === "category" && "bg-primary-1/12 text-primary-1",
        tone === "published" && "bg-primary-1/12 text-primary-1",
        tone === "draft" && "bg-warning-1/12 text-warning-1",
        tone === "archived" && "bg-background-3 text-text-3",
        tone === "comment-open" && "bg-positive-1/12 text-positive-1",
        tone === "comment-locked" && "bg-warning-1/12 text-warning-1",
        tone === "comment-disabled" && "bg-background-3 text-text-3",
        className,
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
  const sortIcon = !isActive
    ? sortLinear
    : currentOrder === "desc"
      ? altArrowDownLinear
      : altArrowUpLinear;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 whitespace-nowrap text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4 transition-colors hover:text-text-2"
    >
      <span>{label}</span>
      <Icon
        icon={sortIcon}
        width="12"
        aria-hidden="true"
        className={cn(
          "shrink-0",
          isActive ? "text-primary-1" : "text-text-4",
        )}
      />
    </button>
  );
}

function InlineVisibilitySwitch({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary-1" : "bg-border-3",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function TableActionButton({
  href,
  ariaLabel,
  icon,
  tone = "neutral",
  onClick,
  disabled,
}: {
  href?: string;
  ariaLabel: string;
  icon: ComponentProps<typeof Icon>["icon"];
  tone?: "neutral" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const className = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
    tone === "neutral"
      ? "text-text-3 hover:bg-background-3 hover:text-text-2"
      : "text-negative-1 hover:bg-negative-1/10",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={className}
        onClick={(event) => event.stopPropagation()}
      >
        <Icon icon={icon} width="16" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={className}
    >
      <Icon icon={icon} width="16" aria-hidden="true" />
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
  const router = useRouter();
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Post | null>(null);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<Post | null>(
    null,
  );
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isHardDeletePending, setIsHardDeletePending] = useState(false);

  const allSelected =
    posts.length > 0 && posts.every((post) => selectedIds.includes(post.id));

  if (isPending) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-4 bg-background-1">
        <div className="grid grid-cols-6 gap-4 border-b border-border-4 px-4 py-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
        <div className="space-y-3 px-4 py-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rect"
              height="4.25rem"
              className="rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-negative-1/30 bg-negative-1/8 px-6 py-8 text-center">
        <p className="text-body-sm text-negative-1">{errorMessage}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-negative-1/30 px-4 py-2 text-body-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
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
      await onDelete(singleDeleteTarget.id);
      setSingleDeleteTarget(null);
    } finally {
      setIsDeletePending(false);
    }
  }

  async function handleHardDeleteConfirm() {
    if (!hardDeleteTarget) return;
    setIsHardDeletePending(true);
    try {
      await onHardDelete(hardDeleteTarget.id);
      setHardDeleteTarget(null);
    } finally {
      setIsHardDeletePending(false);
    }
  }

  if (tab === "trash") {
    return (
      <>
        <div className="overflow-hidden rounded-xl border border-border-4 bg-background-1">
          <div className="overflow-x-auto">
            <table
              className="min-w-full border-separate border-spacing-0"
              aria-label="휴지통 글 목록"
            >
              <thead>
                <tr>
                  <th className="w-4 whitespace-nowrap border-b border-border-4 px-3 py-4 text-center leading-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onToggleSelectAll}
                      className="h-4 w-4 rounded border-border-3 accent-primary-1"
                      aria-label="전체 선택"
                    />
                  </th>
                  <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                    제목
                  </th>
                  <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                    카테고리
                  </th>
                  <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                    삭제일
                  </th>
                  <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="align-middle transition-colors hover:bg-background-2"
                  >
                    <td className="w-4 border-b border-border-4 px-3 py-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(post.id)}
                        onChange={() => onToggleSelect(post.id)}
                        className="h-4 w-4 rounded border-border-3 accent-primary-1"
                        aria-label={`${post.title} 선택`}
                      />
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <span className="truncate whitespace-nowrap text-[14px] font-medium leading-4 text-text-1">
                        {post.title}
                      </span>
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      {post.category ? (
                        <span className="whitespace-nowrap text-[14px] leading-4 text-text-4">
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="whitespace-nowrap text-[14px] leading-4 text-text-4">-</span>
                      )}
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle text-[14px] leading-4 text-text-3">
                      {formatDate(post.deletedAt)}
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onRestore(post.id)}
                          disabled={deleteId === post.id}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-border-3 px-3 text-[12px] font-medium leading-none text-text-2 transition-colors hover:bg-background-3 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          복원
                        </button>
                        <button
                          type="button"
                          onClick={() => setHardDeleteTarget(post)}
                          disabled={deleteId === post.id}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-negative-1 bg-negative-1 px-3 text-[12px] font-medium leading-none text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="overflow-hidden rounded-xl border border-border-4 bg-background-1">
        <div className="overflow-x-auto">
          <table
            className="min-w-full border-separate border-spacing-0"
            aria-label="글 목록"
          >
            <thead>
              <tr>
                <th className="w-4 whitespace-nowrap border-b border-border-4 px-3 py-4 text-center leading-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="h-4 w-4 rounded border-border-3 accent-primary-1"
                    aria-label="전체 선택"
                  />
                </th>
                <th className="w-4 whitespace-nowrap border-b border-border-4 px-3 py-4 text-center leading-4">
                  <Icon
                    icon={pinBold}
                    width="16"
                    aria-hidden="true"
                    className="text-text-4"
                  />
                </th>
                <th className="min-w-[19rem] whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                  제목
                </th>
                <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                  상태
                </th>
                <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left">
                  <SortableHeader
                    label="조회수"
                    field="totalPageviews"
                    currentSort={sort}
                    currentOrder={order}
                    onSort={onSortChange}
                  />
                </th>
                <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left">
                  <SortableHeader
                    label="댓글"
                    field="commentCount"
                    currentSort={sort}
                    currentOrder={order}
                    onSort={onSortChange}
                  />
                </th>
                <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                  댓글 상태
                </th>
                <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left">
                  <SortableHeader
                    label="발행일"
                    field="published_at"
                    currentSort={sort}
                    currentOrder={order}
                    onSort={onSortChange}
                  />
                </th>
                <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                  수정일
                </th>
                <th className="whitespace-nowrap border-b border-border-4 px-4 py-4 text-left text-ui-xs font-semibold uppercase leading-4 tracking-[0.14em] text-text-4">
                  공개
                </th>
                <th className="w-12 whitespace-nowrap border-b border-border-4 px-2 py-4" />
                <th className="w-12 whitespace-nowrap border-b border-border-4 px-2 py-4" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const isSelected = selectedIds.includes(post.id);
                const isTogglePending = pendingToggleIds.has(post.id);
                const isActionPending = deleteId === post.id;
                const commentTone =
                  post.commentStatus === "open"
                    ? "comment-open"
                    : post.commentStatus === "locked"
                      ? "comment-locked"
                      : "comment-disabled";

                return (
                  <tr
                    key={post.id}
                    onClick={() => router.push(`/manage/posts/${post.id}/edit`)}
                    className={cn(
                      "cursor-pointer align-middle transition-colors hover:bg-background-2",
                      isSelected && "bg-primary-1/5",
                    )}
                  >
                    <td
                      className="w-4 border-b border-border-4 px-3 py-3 text-center align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(post.id)}
                        className="mx-auto block h-4 w-4 rounded border-border-3 accent-primary-1"
                        aria-label={`${post.title} 선택`}
                      />
                    </td>
                    <td
                      className="w-4 border-b border-border-4 px-3 py-3 text-center align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onTogglePin(post)}
                        disabled={isTogglePending}
                        className={cn(
                          "mx-auto inline-flex h-4 w-4 cursor-pointer items-center justify-center leading-none transition-colors",
                          post.isPinned
                            ? "text-primary-1 hover:bg-primary-1/10"
                            : "text-text-4 hover:bg-background-3 hover:text-text-2",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                        aria-label={post.isPinned ? "고정 해제" : "고정"}
                      >
                        <Icon
                          icon={post.isPinned ? pinBold : pinLinear}
                          width="16"
                          aria-hidden="true"
                          className="translate-y-[2px] cursor-pointer"
                        />
                      </button>
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <div className="flex max-w-[20rem] items-center gap-3">
                        {post.thumbnailUrl ? (
                          <Image
                            src={post.thumbnailUrl}
                            alt=""
                            width={40}
                            height={30}
                            className="h-[30px] w-10 shrink-0 rounded object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-[30px] w-10 shrink-0 rounded bg-background-3" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="block truncate whitespace-nowrap text-[14px] font-medium leading-4 text-text-1">
                              {post.title}
                            </span>
                            {post.category ? (
                              <Badge tone="category" className="shrink-0">
                                {post.category.name}
                              </Badge>
                            ) : null}
                          </div>
                          {post.summary ? (
                            <p className="mt-0.5 line-clamp-1 whitespace-nowrap text-[12px] leading-4 text-text-4">
                              {post.summary}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <Badge
                        tone={
                          post.status === "published"
                            ? "published"
                            : post.status === "draft"
                              ? "draft"
                              : "archived"
                        }
                      >
                        {statusLabelMap[post.status]}
                      </Badge>
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <span className="flex items-center gap-1 whitespace-nowrap text-[13px] leading-none text-text-4">
                        <Icon icon={eyeLinear} width="14" aria-hidden="true" />
                        {post.totalPageviews.toLocaleString("ko-KR")}
                      </span>
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <span className="flex items-center gap-1 whitespace-nowrap text-[13px] leading-none text-text-4">
                        <Icon
                          icon={chatRoundDotsLinear}
                          width="14"
                          aria-hidden="true"
                        />
                        {post.commentCount.toLocaleString("ko-KR")}
                      </span>
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      {post.commentStatus ? (
                        <Badge tone={commentTone}>
                          {commentStatusLabelMap[post.commentStatus]}
                        </Badge>
                      ) : (
                        <span className="whitespace-nowrap text-[14px] leading-5 text-text-4">-</span>
                      )}
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <span className="inline-flex min-h-4 items-center whitespace-nowrap text-[13px] leading-none text-text-4">
                        {formatDate(post.publishedAt)}
                      </span>
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <span className="inline-flex min-h-4 items-center whitespace-nowrap text-[13px] leading-none text-text-4">
                        {formatDate(post.contentModifiedAt)}
                      </span>
                    </td>
                    <td
                      className="min-w-[104px] border-b border-border-4 px-3 py-3 align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <InlineVisibilitySwitch
                          checked={post.visibility === "public"}
                          disabled={isTogglePending}
                          onClick={() => onToggleVisibility(post)}
                        />
                        <span
                          className={cn(
                            "whitespace-nowrap text-[12px] font-medium leading-4",
                            post.visibility === "public"
                              ? "text-primary-1"
                              : "text-text-4",
                          )}
                        >
                          {visibilityLabelMap[post.visibility]}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <TableActionButton
                        href={`/manage/posts/${post.id}/preview`}
                        ariaLabel="미리보기"
                        icon={eyeLinear}
                      />
                    </td>
                    <td className="border-b border-border-4 px-3 py-3 align-middle">
                      <TableActionButton
                        ariaLabel="삭제"
                        icon={trashBinMinimalisticLinear}
                        tone="danger"
                        onClick={() => setSingleDeleteTarget(post)}
                        disabled={isActionPending}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
