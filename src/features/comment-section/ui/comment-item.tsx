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
      <article className="border-b border-border-4 py-4">
        <p className="text-body-sm italic text-text-4">삭제된 댓글입니다.</p>
        {showReplyToggle ? (
          <div className="mt-2">
            <button
              type="button"
              onClick={onToggleReplies}
              className="inline-flex items-center gap-1 text-ui-sm text-text-3 transition-colors hover:text-text-1"
            >
              답글 {replyCount}개
              <ChevronIcon expanded={repliesExpanded} />
            </button>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article className="border-b border-border-4 py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-ui-sm font-semibold text-text-1">
          {comment.author.name}
        </span>
        <time
          dateTime={comment.createdAt}
          className="text-[0.688rem] text-text-4"
        >
          {formatDate(comment.createdAt)}
        </time>
        {comment.isSecret ? <LockIcon /> : null}
      </div>

      <p className="mt-2 whitespace-pre-wrap break-keep text-body-sm leading-[1.7] text-text-2">
        {comment.replyToName ? (
          <span className="text-body-sm font-bold text-primary-1">
            @{comment.replyToName}{" "}
          </span>
        ) : null}
        {body}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {canReply ? (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="text-ui-xs font-medium text-text-4 transition-colors hover:text-text-2"
          >
            답글
          </button>
        ) : null}

        {showDelete ? (
          <button
            type="button"
            onClick={() => onDelete(comment)}
            className="text-ui-xs font-medium text-text-4 transition-colors hover:text-text-2"
          >
            삭제
          </button>
        ) : null}
      </div>

      {showReplyToggle ? (
        <div className="mt-1">
          <button
            type="button"
            onClick={onToggleReplies}
            className="inline-flex items-center gap-1 text-ui-sm text-text-3 transition-colors hover:text-text-1"
          >
            답글 {replyCount}개
            <ChevronIcon expanded={repliesExpanded} />
          </button>
        </div>
      ) : null}
    </article>
  );
}
