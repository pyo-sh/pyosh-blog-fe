"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AdminCommentItem } from "@entities/comment";
import { fetchAdminCommentThread } from "@entities/comment";
import { cn } from "@shared/lib/style-utils";

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
  items: AdminCommentItem[];
  isLoading: boolean;
}

interface CommentDetailModalProps {
  comment: AdminCommentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentDetailModal({
  comment,
  isOpen,
  onClose,
}: CommentDetailModalProps) {
  const [mode, setMode] = useState<ModalMode>("detail");
  const [currentComment, setCurrentComment] = useState<AdminCommentItem | null>(
    null,
  );
  const [originComment, setOriginComment] = useState<AdminCommentItem | null>(
    null,
  );
  const [thread, setThread] = useState<ThreadState>({
    items: [],
    isLoading: false,
  });
  const [parentExpanded, setParentExpanded] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  // Reset state when comment changes
  useEffect(() => {
    if (comment) {
      setCurrentComment(comment);
      setOriginComment(comment);
      setMode("detail");
      setParentExpanded(false);
      setThread({ items: [], isLoading: false });
      setThreadError(null);
    }
  }, [comment]);

  // ESC key close
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const loadThread = useCallback(
    async (commentId: number) => {
      if (thread.items.length > 0) return;

      setThread((prev) => ({ ...prev, isLoading: true }));
      setThreadError(null);
      try {
        const items = await fetchAdminCommentThread(commentId);
        setThread({ items, isLoading: false });
      } catch {
        setThread({ items: [], isLoading: false });
        setThreadError("스레드를 불러오지 못했습니다.");
      }
    },
    [thread.items.length],
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

    if (thread.items.length === 0) {
      await loadThread(currentComment.id);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grey-2/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="댓글 상세"
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-2 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-border-3 px-6 py-4">
          <h2 className="text-base font-semibold text-text-1">
            {mode === "thread" ? "관련 댓글" : "댓글 상세"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-3 transition-colors hover:bg-background-3 hover:text-text-1"
            aria-label="모달 닫기"
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {mode === "detail" ? (
            <DetailView
              comment={currentComment}
              parentComment={parentComment}
              parentExpanded={parentExpanded}
              threadCount={threadCount}
              threadLoading={thread.isLoading}
              threadError={threadError}
              onToggleParent={() => void handleToggleParent()}
              onOpenThread={() => void handleOpenThread()}
            />
          ) : (
            <ThreadView
              items={thread.items}
              focusId={currentComment.id}
              originComment={originComment}
              isLoading={thread.isLoading}
              onClickComment={handleClickThreadComment}
              onBack={handleBackToDetail}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface DetailViewProps {
  comment: AdminCommentItem;
  parentComment: AdminCommentItem | null;
  parentExpanded: boolean;
  threadCount: number | undefined;
  threadLoading: boolean;
  threadError: string | null;
  onToggleParent: () => void;
  onOpenThread: () => void;
}

function DetailView({
  comment,
  parentComment,
  parentExpanded,
  threadCount,
  threadLoading,
  threadError,
  onToggleParent,
  onOpenThread,
}: DetailViewProps) {
  const isReply = comment.depth > 0;

  return (
    <div className="space-y-5 p-6">
      {/* Metadata */}
      <dl className="space-y-2 text-sm">
        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-text-4">글</dt>
          <dd className="flex items-center gap-2 text-text-1">
            {comment.post ? (
              <>
                <span className="line-clamp-1">{comment.post.title}</span>
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

        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-text-4">작성자</dt>
          <dd className="flex items-center gap-2 text-text-1">
            {comment.author.name}
            <span className="rounded-full bg-background-3 px-2 py-0.5 text-xs text-text-3">
              {authorTypeLabel(comment.author.type)}
            </span>
          </dd>
        </div>

        {comment.author.email ? (
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-text-4">이메일</dt>
            <dd className="text-text-2">{comment.author.email}</dd>
          </div>
        ) : null}

        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-text-4">작성일</dt>
          <dd className="text-text-2">{formatDetailDate(comment.createdAt)}</dd>
        </div>

        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-text-4">비밀</dt>
          <dd className="text-text-2">
            {comment.isSecret ? "예 🔒" : "아니요"}
          </dd>
        </div>

        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-text-4">상태</dt>
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
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-text-4">답글 대상</dt>
            <dd className="text-text-2">@{comment.replyToName}</dd>
          </div>
        ) : null}
      </dl>

      {/* Parent comment toggle */}
      {isReply ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onToggleParent}
            disabled={threadLoading && !parentExpanded}
            className="flex items-center gap-2 text-sm font-medium text-text-2 transition-colors hover:text-text-1 disabled:opacity-60"
          >
            <span>{parentExpanded ? "▼" : "▶"}</span>
            {parentExpanded ? "부모 댓글 숨기기" : "부모 댓글 보기"}
            {threadLoading && !parentExpanded ? (
              <span className="text-xs text-text-4">로딩 중...</span>
            ) : null}
          </button>

          {parentExpanded ? (
            <div className="rounded-[1rem] border border-border-3 bg-background-1 p-4">
              {parentComment ? (
                <>
                  <div className="mb-2 flex items-center gap-2 text-xs text-text-4">
                    <span className="font-medium text-text-2">
                      {parentComment.author.name}
                    </span>
                    <span>[{authorTypeLabel(parentComment.author.type)}]</span>
                    <span>·</span>
                    <span>{formatDetailDate(parentComment.createdAt)}</span>
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

      {/* Body */}
      <div className="space-y-2">
        <div className="border-t border-border-3 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-4">
            본문
          </p>
          <p className="text-sm text-text-1 whitespace-pre-wrap break-words leading-relaxed">
            {comment.body}
          </p>
        </div>
      </div>

      {/* Thread link */}
      {threadError ? (
        <p className="text-sm text-negative-1">{threadError}</p>
      ) : null}

      <div className="border-t border-border-3 pt-4">
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
}

function ThreadView({
  items,
  focusId,
  originComment,
  isLoading,
  onClickComment,
  onBack,
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
    <div className="space-y-4 p-6">
      {/* Thread header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {postTitle ? (
            <>
              <span className="text-sm text-text-2">글: {postTitle}</span>
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
          className="flex items-center gap-1 text-sm font-medium text-primary-1 transition-colors hover:text-primary-2"
        >
          ← 상세로 돌아가기
        </button>
      </div>

      {/* Thread items */}
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
                "w-full rounded-[1rem] border p-4 text-left transition-colors hover:border-primary-1/50",
                isFocused
                  ? "border-primary-1 bg-primary-2/10"
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
                  · {formatDetailDate(item.createdAt)}
                </span>
                {item.isSecret ? (
                  <span className="text-primary-1" title="비밀 댓글">
                    🔒
                  </span>
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
    </div>
  );
}
