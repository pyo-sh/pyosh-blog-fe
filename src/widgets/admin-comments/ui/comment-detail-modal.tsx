"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import closeCircleLinear from "@iconify-icons/solar/close-circle-linear";
import lockKeyholeLinear from "@iconify-icons/solar/lock-keyhole-linear";
import Link from "next/link";
import type { AdminCommentItem } from "@entities/comment";
import { fetchAdminCommentThread } from "@entities/comment";
import { cn } from "@shared/lib/style-utils";
import { Modal } from "@shared/ui/libs";

const detailDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const statusLabelMap: Record<AdminCommentItem["status"], string> = {
  active: "정상",
  deleted: "삭제됨",
  hidden: "숨김",
};

const authorTypeLabel = (type: "oauth" | "guest") =>
  type === "oauth" ? "OAuth" : "게스트";

function formatDetailDate(value: string) {
  return detailDateFormatter.format(new Date(value));
}

type ModalMode = "detail" | "thread";

interface ThreadState {
  commentId: number | null;
  items: AdminCommentItem[];
  isLoading: boolean;
}

interface CommentDetailModalProps {
  comment: AdminCommentItem | null;
  isOpen: boolean;
  isActionPending?: boolean;
  onClose: () => void;
  onCommentChange?: (comment: AdminCommentItem) => void;
  onSelectAction: (
    comment: AdminCommentItem,
    action: "restore" | "soft_delete" | "hard_delete",
  ) => void;
}

export function CommentDetailModal({
  comment,
  isOpen,
  isActionPending = false,
  onClose,
  onCommentChange,
  onSelectAction,
}: CommentDetailModalProps) {
  const [mode, setMode] = useState<ModalMode>("detail");
  const [currentComment, setCurrentComment] = useState<AdminCommentItem | null>(
    null,
  );
  const [originComment, setOriginComment] = useState<AdminCommentItem | null>(
    null,
  );
  const [thread, setThread] = useState<ThreadState>({
    commentId: null,
    items: [],
    isLoading: false,
  });
  const [parentExpanded, setParentExpanded] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const activeCommentIdRef = useRef<number | null>(comment?.id ?? null);
  const threadRequestSeqRef = useRef(0);

  // Reset state when comment changes
  useEffect(() => {
    activeCommentIdRef.current = comment?.id ?? null;

    if (comment) {
      setCurrentComment(comment);
      setOriginComment(comment);
      setMode("detail");
      setParentExpanded(false);
      setThread({ commentId: null, items: [], isLoading: false });
      setThreadError(null);
    }
  }, [comment]);

  useEffect(() => {
    activeCommentIdRef.current = currentComment?.id ?? null;
    if (currentComment) {
      onCommentChange?.(currentComment);
    }
  }, [currentComment, onCommentChange]);

  const loadThread = useCallback(
    async (commentId: number) => {
      if (thread.commentId === commentId && thread.items.length > 0) {
        return true;
      }

      const requestSeq = ++threadRequestSeqRef.current;

      setThread((prev) => ({
        commentId: prev.commentId === commentId ? prev.commentId : null,
        items: prev.commentId === commentId ? prev.items : [],
        isLoading: true,
      }));
      setThreadError(null);

      try {
        const items = await fetchAdminCommentThread(commentId);

        if (
          activeCommentIdRef.current !== commentId ||
          threadRequestSeqRef.current !== requestSeq
        ) {
          return false;
        }

        setThread({ commentId, items, isLoading: false });

        return true;
      } catch {
        if (
          activeCommentIdRef.current !== commentId ||
          threadRequestSeqRef.current !== requestSeq
        ) {
          return false;
        }

        setThread({ commentId: null, items: [], isLoading: false });
        setThreadError("스레드를 불러오지 못했습니다.");

        return false;
      }
    },
    [thread.commentId, thread.items],
  );

  async function handleToggleParent() {
    if (!currentComment) return;

    if (!parentExpanded && thread.items.length === 0) {
      await loadThread(currentComment.id);
    }

    setParentExpanded((prev) => !prev);
  }

  async function handleOpenThread() {
    if (!currentComment) return;

    const hasThread =
      thread.commentId === currentComment.id && thread.items.length > 0;
    const didLoadSucceed = hasThread || (await loadThread(currentComment.id));

    if (!didLoadSucceed) {
      return;
    }

    setOriginComment(currentComment);
    setMode("thread");
  }

  function handleBackToDetail() {
    setMode("detail");
    setCurrentComment(originComment);
  }

  function handleClickThreadComment(item: AdminCommentItem) {
    setCurrentComment(item);
    setParentExpanded(false);
    setThreadError(null);
    setMode("detail");
  }

  if (!isOpen || !currentComment) return null;

  const isReply = currentComment.depth > 0;
  const parentComment =
    isReply && thread.items.length > 0
      ? (thread.items.find((c) => c.id === currentComment.parentId) ?? null)
      : null;
  const threadCount = thread.items.length > 0 ? thread.items.length : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      withBackground
      aria-label={mode === "thread" ? "댓글 스레드 보기" : "댓글 상세 보기"}
      className="w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-2"
    >
      <div className="relative flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-bold text-text-1">
            {mode === "thread" ? "관련 댓글" : "댓글 상세"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3 hover:text-text-1"
            aria-label="모달 닫기"
          >
            <Icon icon={closeCircleLinear} width="22" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {mode === "detail" ? (
            <DetailView
              comment={currentComment}
              parentComment={parentComment}
              parentExpanded={parentExpanded}
              threadCount={threadCount}
              threadLoading={thread.isLoading}
              threadError={threadError}
              isActionPending={isActionPending}
              onToggleParent={() => void handleToggleParent()}
              onOpenThread={() => void handleOpenThread()}
              onClose={onClose}
              onSelectAction={(action) =>
                onSelectAction(currentComment, action)
              }
            />
          ) : (
            <ThreadView
              items={thread.items}
              focusId={currentComment.id}
              originComment={originComment}
              isLoading={thread.isLoading}
              onClickComment={handleClickThreadComment}
              onBack={handleBackToDetail}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

interface DetailViewProps {
  comment: AdminCommentItem;
  parentComment: AdminCommentItem | null;
  parentExpanded: boolean;
  threadCount: number | undefined;
  threadLoading: boolean;
  threadError: string | null;
  isActionPending: boolean;
  onToggleParent: () => void;
  onOpenThread: () => void;
  onClose: () => void;
  onSelectAction: (action: "restore" | "soft_delete" | "hard_delete") => void;
}

function DetailView({
  comment,
  parentComment,
  parentExpanded,
  threadCount,
  threadLoading,
  threadError,
  isActionPending,
  onToggleParent,
  onOpenThread,
  onClose,
  onSelectAction,
}: DetailViewProps) {
  const isReply = comment.depth > 0;
  const actionButtons =
    comment.status === "deleted" || comment.status === "hidden"
      ? [
          {
            value: "restore" as const,
            label: "복원",
            tone: "default" as const,
          },
          {
            value: "hard_delete" as const,
            label: "영구 삭제",
            tone: "danger" as const,
          },
        ]
      : [
          {
            value: "soft_delete" as const,
            label: "소프트 삭제",
            tone: "default" as const,
          },
          {
            value: "hard_delete" as const,
            label: "영구 삭제",
            tone: "danger" as const,
          },
        ];

  return (
    <div className="space-y-5">
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <dt className="min-w-[3.75rem] shrink-0 text-text-3">글:</dt>
          <dd className="flex items-center gap-2 text-text-1">
            {comment.post ? (
              <>
                <span className="line-clamp-1 text-primary-1">
                  {comment.post.title}
                </span>
                <Link
                  href={`/manage/posts/${comment.postId}/preview`}
                  className="shrink-0 text-xs text-primary-1 transition-colors hover:text-primary-2"
                  target="_blank"
                >
                  글 보기 →
                </Link>
              </>
            ) : (
              <span className="text-text-4">삭제된 글</span>
            )}
          </dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="min-w-[3.75rem] shrink-0 text-text-3">작성자:</dt>
          <dd className="flex items-center gap-2 text-text-1">
            {comment.author.name}
            <span className="rounded bg-primary-1/10 px-1.5 py-0.5 text-[0.6875rem] text-primary-1">
              {authorTypeLabel(comment.author.type)}
            </span>
          </dd>
        </div>

        {comment.author.email ? (
          <div className="flex items-center gap-2">
            <dt className="min-w-[3.75rem] shrink-0 text-text-3">이메일:</dt>
            <dd className="text-text-2">{comment.author.email}</dd>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <dt className="min-w-[3.75rem] shrink-0 text-text-3">작성일:</dt>
          <dd className="text-text-2">{formatDetailDate(comment.createdAt)}</dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="min-w-[3.75rem] shrink-0 text-text-3">비밀:</dt>
          <dd className="text-text-2">{comment.isSecret ? "예" : "아니오"}</dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="min-w-[3.75rem] shrink-0 text-text-3">상태:</dt>
          <dd>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                comment.status === "active" &&
                  "bg-positive-1/10 text-positive-1",
                comment.status === "deleted" &&
                  "bg-negative-1/10 text-negative-1",
                comment.status === "hidden" && "bg-background-3 text-text-3",
              )}
            >
              {statusLabelMap[comment.status]}
            </span>
          </dd>
        </div>

        {isReply && comment.replyToName ? (
          <div className="flex items-center gap-2">
            <dt className="min-w-[3.75rem] shrink-0 text-text-3">답글 대상:</dt>
            <dd className="text-text-2">@{comment.replyToName}</dd>
          </div>
        ) : null}
      </dl>

      {isReply ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onToggleParent}
            disabled={threadLoading && !parentExpanded}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary-1 transition-colors hover:bg-background-3 disabled:opacity-60"
          >
            <span>{parentExpanded ? "▼" : "▶"}</span>
            {parentExpanded ? "부모 댓글 숨기기" : "부모 댓글 보기"}
            {threadLoading && !parentExpanded ? (
              <span className="text-xs text-text-4">로딩 중...</span>
            ) : null}
          </button>

          {parentExpanded ? (
            <div className="rounded-lg border border-border-4 bg-background-1 p-3">
              {parentComment ? (
                <>
                  <div className="mb-2 flex items-center gap-2 text-xs">
                    <span className="font-medium text-text-1">
                      {parentComment.author.name}
                    </span>
                    <span className="rounded bg-background-3 px-1.5 py-0.5 text-text-3">
                      {authorTypeLabel(parentComment.author.type)}
                    </span>
                    <span className="text-text-4">
                      {formatDetailDate(parentComment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-text-2 whitespace-pre-wrap break-words">
                    {parentComment.body}
                  </p>
                </>
              ) : (
                <p className="text-sm text-text-4">
                  부모 댓글을 불러올 수 없습니다.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-medium text-text-3">본문</p>
        <div className="rounded-lg border border-border-4 bg-background-1 p-3">
          <p className="text-sm text-text-2 whitespace-pre-wrap break-words leading-relaxed">
            {comment.body}
          </p>
        </div>
      </div>

      {/* Thread link */}
      {threadError ? (
        <p className="text-sm text-negative-1">{threadError}</p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={onOpenThread}
          disabled={threadLoading}
          className="w-full rounded-[0.75rem] border border-border-3 px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {threadLoading
            ? "스레드 불러오는 중..."
            : threadCount !== undefined
              ? `관련 댓글 모두 보기 (${threadCount}개)`
              : "관련 댓글 모두 보기"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          닫기
        </button>
        {actionButtons.map((action) => (
          <button
            key={action.value}
            type="button"
            onClick={() => onSelectAction(action.value)}
            disabled={isActionPending}
            className={cn(
              "inline-flex items-center justify-center rounded-[0.75rem] px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              action.tone === "danger"
                ? "border border-negative-1/30 text-negative-1 hover:bg-negative-1/10"
                : "border border-border-3 text-text-2 hover:border-border-2 hover:text-text-1",
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ThreadViewProps {
  items: AdminCommentItem[];
  focusId: number;
  originComment: AdminCommentItem | null;
  isLoading: boolean;
  onClickComment: (comment: AdminCommentItem) => void;
  onBack: () => void;
  onClose?: () => void;
}

function ThreadView({
  items,
  focusId,
  originComment,
  isLoading,
  onClickComment,
  onBack,
  onClose,
}: ThreadViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 text-sm text-text-4">
        스레드 불러오는 중...
      </div>
    );
  }

  const postTitle = originComment?.post?.title;
  const postId = originComment?.postId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {postTitle ? (
            <>
              <span className="text-sm text-text-3">글:</span>
              <span className="text-sm text-primary-1">{postTitle}</span>
              {postId ? (
                <Link
                  href={`/manage/posts/${postId}/preview`}
                  className="text-xs text-primary-1 transition-colors hover:text-primary-2"
                  target="_blank"
                >
                  글 보기 →
                </Link>
              ) : null}
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary-1 transition-colors hover:bg-background-3 hover:text-primary-2"
        >
          ← 상세로 돌아가기
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isFocused = item.id === focusId;
          const isReply = item.depth > 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onClickComment(item)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-colors hover:border-primary-1/50",
                isFocused
                  ? "border-l-[3px] border-primary-1 bg-primary-2/10"
                  : "border-border-3 hover:bg-background-1",
                isReply && "ml-5",
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium text-text-2">
                  {isReply ? (
                    <span className="mr-0.5 text-text-4">↳</span>
                  ) : null}
                  {item.author.name}
                </span>
                <span className="rounded-full bg-background-3 px-1.5 py-0.5 text-text-3">
                  {authorTypeLabel(item.author.type)}
                </span>
                <span className="text-text-4">
                  {formatDetailDate(item.createdAt)}
                </span>
                {item.isSecret ? (
                  <Icon
                    icon={lockKeyholeLinear}
                    width="14"
                    aria-hidden="true"
                    className="text-secondary-1"
                  />
                ) : null}
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
                    item.status === "active" &&
                      "bg-positive-1/10 text-positive-1",
                    item.status === "deleted" &&
                      "bg-negative-1/10 text-negative-1",
                    item.status === "hidden" && "bg-background-3 text-text-3",
                  )}
                >
                  {statusLabelMap[item.status]}
                </span>
                {isFocused ? (
                  <span className="rounded-full bg-primary-1/10 px-2 py-0.5 text-xs font-medium text-primary-1">
                    현재 댓글
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-text-1 whitespace-pre-wrap break-words">
                {item.replyToName ? (
                  <span className="text-text-4">@{item.replyToName} </span>
                ) : null}
                {item.body}
              </p>
            </button>
          );
        })}
      </div>

      {onClose ? (
        <div className="border-t border-border-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
          >
            닫기
          </button>
        </div>
      ) : null}
    </div>
  );
}
