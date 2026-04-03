"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import lockLinear from "@iconify-icons/solar/lock-linear";
import trashBinMinimalisticLinear from "@iconify-icons/solar/trash-bin-minimalistic-linear";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  adminDeleteComment,
  adminRestoreComment,
  fetchAdminComments,
  fetchAdminCommentThread,
  type AdminCommentItem,
  useAdminCommentStatusMutation,
} from "@entities/comment";
import { formatNumber } from "@shared/lib/format-number";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";
import { Skeleton, Spinner } from "@shared/ui/libs";
import {
  type CommentManageAction,
  CommentDeleteModal,
} from "@widgets/admin-comments/ui/comment-delete-modal";
import { CommentDetailModal } from "@widgets/admin-comments/ui/comment-detail-modal";

const fallbackDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();

  if (diffMs < 0) return "방금 전";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;

  return fallbackDateFormatter.format(new Date(value));
}

function AuthorTypeBadge({ type }: { type: "oauth" | "guest" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-[0.3125rem] py-px text-[0.625rem] font-medium",
        type === "oauth"
          ? "bg-primary-1 text-white"
          : "bg-background-3 text-text-3",
      )}
    >
      {type === "oauth" ? "회원" : "비회원"}
    </span>
  );
}

function CommentAvatar({ name }: { name: string }) {
  return (
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background-3 text-xs font-semibold text-text-3">
      {name.slice(0, 1)}
    </div>
  );
}

function CommentItemSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg px-2 py-3">
      <Skeleton height="2rem" width="2rem" className="rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Skeleton height="1rem" width="2.25rem" />
          <Skeleton height="1rem" width="4rem" />
          <Skeleton height="1rem" width="10rem" />
        </div>
        <Skeleton height="1rem" />
      </div>
    </div>
  );
}

function CommentRow({
  item,
  isDeleting,
  onOpen,
  onDelete,
}: {
  item: AdminCommentItem;
  isDeleting: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-background-1"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <CommentAvatar name={item.author.name} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <AuthorTypeBadge type={item.author.type} />
          <span className="text-[0.8125rem] font-medium text-text-1">
            {item.author.name}
          </span>
          {item.isSecret ? (
            <span className="inline-flex items-center rounded bg-secondary-1/10 px-1.5 py-px text-secondary-1">
              <Icon icon={lockLinear} width="12" aria-hidden="true" />
            </span>
          ) : null}
          <span className="truncate text-[0.75rem] text-text-4">
            · {item.post.title}
          </span>
          <span className="text-[0.75rem] text-text-4">
            · {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        <p className="line-clamp-1 break-keep text-[0.8125rem] text-text-2">
          {item.replyToName ? (
            <span className="mr-1">
              ↳{" "}
              <span className="font-medium text-primary-1">
                @{item.replyToName}
              </span>
            </span>
          ) : null}
          {item.body}
        </p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        aria-label={`"${item.post.title}" 글의 ${item.author.name} 댓글 삭제`}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-4 transition-colors hover:bg-background-3 hover:text-negative-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? (
          <Spinner size="sm" />
        ) : (
          <Icon
            icon={trashBinMinimalisticLinear}
            width="16"
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}

const QUERY_KEY = ["dashboard", "recentComments"] as const;
const ADMIN_COMMENTS_QUERY_KEY = ["admin-comments"] as const;

function getAllowedActionsForStatus(status: AdminCommentItem["status"]) {
  if (status === "deleted") {
    return ["restore", "hard_delete"] as const;
  }

  if (status === "hidden") {
    return ["restore", "soft_delete", "hard_delete"] as const;
  }

  return ["soft_delete", "hard_delete"] as const;
}

export function RecentCommentsSection() {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [openedComment, setOpenedComment] = useState<AdminCommentItem | null>(
    null,
  );
  const [actionContext, setActionContext] = useState<{
    item: AdminCommentItem;
    defaultAction?: CommentManageAction;
  } | null>(null);
  const [cascadeCount, setCascadeCount] = useState<number | undefined>(
    undefined,
  );
  const cascadeRequestSeqRef = useRef(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchAdminComments({ limit: 5 }),
  });
  const statusMutation = useAdminCommentStatusMutation({
    onSuccess: (updatedComment) => {
      setOpenedComment((current) =>
        current?.id === updatedComment.id ? updatedComment : current,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      item,
      action,
    }: {
      item: AdminCommentItem;
      action: CommentManageAction;
    }) => {
      if (action === "restore") {
        await adminRestoreComment(item.id);

        return;
      }

      await adminDeleteComment(item.id, action);
    },
    onMutate: () => {
      setDeleteError(null);
    },
    onSuccess: async (_data, variables) => {
      if (openedComment?.id === variables.item.id) {
        setOpenedComment(null);
      }

      setActionContext(null);
      setCascadeCount(undefined);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: ADMIN_COMMENTS_QUERY_KEY,
      });
    },
    onError: (err) => {
      setDeleteError(getErrorMessage(err, "댓글 삭제에 실패했습니다."));
    },
  });

  const comments = data?.data ?? [];
  const totalComments = data?.meta.total ?? 0;
  const activeDeleteId = deleteMutation.variables?.item.id ?? null;
  const actionModalActions = actionContext
    ? getAllowedActionsForStatus(actionContext.item.status)
    : [];

  const handleOpenActionModal = useCallback(
    (item: AdminCommentItem, defaultAction?: CommentManageAction) => {
      setDeleteError(null);
      setActionContext({ item, defaultAction });
      setCascadeCount(undefined);
    },
    [],
  );

  const handleCloseActionModal = useCallback(() => {
    if (deleteMutation.isPending) {
      return;
    }

    setActionContext(null);
    setCascadeCount(undefined);
  }, [deleteMutation.isPending]);

  useEffect(() => {
    async function loadCascade() {
      if (!actionContext) {
        cascadeRequestSeqRef.current += 1;
        setCascadeCount(undefined);

        return;
      }

      const requestSeq = ++cascadeRequestSeqRef.current;
      const targetCommentId = actionContext.item.id;

      if (actionContext.item.depth > 0) {
        if (
          cascadeRequestSeqRef.current === requestSeq &&
          actionContext.item.id === targetCommentId
        ) {
          setCascadeCount(0);
        }

        return;
      }

      try {
        const thread = await fetchAdminCommentThread(targetCommentId);

        if (
          cascadeRequestSeqRef.current !== requestSeq ||
          actionContext.item.id !== targetCommentId
        ) {
          return;
        }

        setCascadeCount(
          thread.filter((item) => item.parentId === targetCommentId).length,
        );
      } catch {
        if (
          cascadeRequestSeqRef.current === requestSeq &&
          actionContext.item.id === targetCommentId
        ) {
          setCascadeCount(undefined);
        }
      }
    }

    void loadCascade();
  }, [actionContext]);

  return (
    <section className="rounded-xl border border-border-4 bg-background-2 p-5">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-body-base font-bold text-text-1">최근 댓글</h2>
        <span className="inline-flex rounded-md bg-primary-1/10 px-2 py-0.5 text-xs font-medium text-primary-1">
          {formatNumber(totalComments)}
        </span>
        <Link
          href="/manage/comments"
          className="ml-auto text-sm text-primary-1 transition-colors hover:text-primary-2"
        >
          전체보기
        </Link>
      </div>

      {isLoading ? (
        <div aria-busy="true" className="space-y-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <CommentItemSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-lg border border-negative-1/20 bg-negative-1/5 px-4 py-6 text-center">
          <p className="text-sm text-negative-1">
            {getErrorMessage(error, "최근 댓글을 불러오지 못했습니다.")}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 inline-flex rounded-lg border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        comments.length > 0 ? (
          <div className="divide-y divide-border-4">
            {comments.map((comment) => (
              <CommentRow
                key={comment.id}
                item={comment}
                isDeleting={
                  deleteMutation.isPending && activeDeleteId === comment.id
                }
                onOpen={() => setOpenedComment(comment)}
                onDelete={() => handleOpenActionModal(comment, "soft_delete")}
              />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-text-4">
            댓글이 없습니다.
          </p>
        )
      ) : null}

      {deleteError ? (
        <p className="mt-3 text-sm text-negative-1">{deleteError}</p>
      ) : null}

      <CommentDetailModal
        comment={openedComment}
        isOpen={openedComment !== null && actionContext === null}
        isActionPending={
          deleteMutation.isPending && activeDeleteId === openedComment?.id
        }
        isStatusPending={
          statusMutation.isPending &&
          statusMutation.variables?.comment.id === openedComment?.id
        }
        statusError={statusMutation.errorMessage}
        onClose={() => setOpenedComment(null)}
        onCommentChange={setOpenedComment}
        onSelectStatus={(comment, status) => {
          void statusMutation.changeStatus(comment, status);
        }}
        onSelectAction={(comment, action) =>
          handleOpenActionModal(comment, action)
        }
      />

      <CommentDeleteModal
        isOpen={actionContext !== null}
        title="댓글 작업"
        count={1}
        cascadeCount={cascadeCount}
        allowedActions={[...actionModalActions]}
        defaultAction={actionContext?.defaultAction}
        isPending={deleteMutation.isPending}
        onClose={handleCloseActionModal}
        onConfirm={async (action) => {
          if (!actionContext) {
            return;
          }

          await deleteMutation.mutateAsync({
            item: actionContext.item,
            action,
          });
        }}
      />
    </section>
  );
}
