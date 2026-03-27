"use client";

import type { Comment } from "@entities/comment";

interface CommentItemProps {
  comment: Comment;
  body: string;
  onReply: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  allowReply?: boolean;
  canDelete?: boolean;
  showReplyToggle?: boolean;
  repliesExpanded?: boolean;
  replyCount?: number;
  onToggleReplies?: () => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 text-text-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="비밀글"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {expanded ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
    </svg>
  );
}

export function CommentItem({
  comment,
  body,
  onReply,
  onDelete,
  allowReply = true,
  canDelete = true,
  showReplyToggle = false,
  repliesExpanded = true,
  replyCount = 0,
  onToggleReplies,
}: CommentItemProps) {
  const isDeleted = comment.status === "deleted";
  const canReply = allowReply && !isDeleted;
  const showDelete = canDelete && !isDeleted;

  if (isDeleted) {
    return (
      <article className="rounded-[1.5rem] border border-border-3 bg-background-1 p-5">
        <p className="text-body-md italic text-text-4">삭제된 댓글입니다.</p>
        {showReplyToggle ? (
          <button
            type="button"
            onClick={onToggleReplies}
            className="mt-5 inline-flex items-center gap-2 text-body-sm text-text-3 transition-colors hover:text-text-1"
          >
            답글 {replyCount}개
            <ChevronIcon expanded={repliesExpanded} />
          </button>
        ) : null}
      </article>
    );
  }

  return (
    <article className="rounded-[1.5rem] border border-border-3 bg-background-1 p-5">
      <div className="flex flex-wrap items-center gap-3 text-body-sm text-text-3">
        <span className="font-semibold text-text-1">{comment.author.name}</span>
        <time dateTime={comment.createdAt}>
          {formatDate(comment.createdAt)}
        </time>
        {comment.isSecret ? <LockIcon /> : null}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-body-md text-text-2">
        {comment.replyToName ? (
          <span className="font-bold text-primary-1">
            @{comment.replyToName}{" "}
          </span>
        ) : null}
        {body}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        {canReply ? (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="text-body-sm font-medium text-primary-1 transition-opacity hover:opacity-80"
          >
            답글
          </button>
        ) : null}

        {showDelete ? (
          <button
            type="button"
            onClick={() => onDelete(comment)}
            className="text-body-sm font-medium text-text-3 transition-opacity hover:opacity-80"
          >
            삭제
          </button>
        ) : null}

        {showReplyToggle ? (
          <button
            type="button"
            onClick={onToggleReplies}
            className="inline-flex items-center gap-2 text-body-sm text-text-3 transition-colors hover:text-text-1"
          >
            답글 {replyCount}개
            <ChevronIcon expanded={repliesExpanded} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
