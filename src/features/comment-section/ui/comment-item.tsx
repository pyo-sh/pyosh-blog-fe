"use client";

import type { Comment } from "@entities/comment";

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function getBody(comment: Comment) {
  if (comment.status === "deleted") {
    return "삭제된 댓글입니다.";
  }

  return comment.body;
}

export function CommentItem({ comment, onReply, onDelete }: CommentItemProps) {
  const canReply = comment.depth === 0;

  return (
    <li className={comment.depth > 0 ? "border-l border-border-3 pl-5" : ""}>
      <article className="rounded-[1.5rem] border border-border-3 bg-background-1 p-5">
        <div className="flex flex-wrap items-center gap-3 text-body-sm text-text-3">
          <span className="font-semibold text-text-1">
            {comment.author.name}
          </span>
          <time dateTime={comment.createdAt}>
            {formatDate(comment.createdAt)}
          </time>
          {comment.replyToName ? (
            <span className="rounded-full bg-background-2 px-3 py-1 text-body-xs text-text-4">
              @{comment.replyToName}
            </span>
          ) : null}
          {comment.isSecret ? (
            <span className="rounded-full bg-background-2 px-3 py-1 text-body-xs text-text-4">
              Secret
            </span>
          ) : null}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-body-md text-text-2">
          {getBody(comment)}
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

          <button
            type="button"
            onClick={() => onDelete(comment)}
            className="text-body-sm font-medium text-text-3 transition-opacity hover:opacity-80"
          >
            삭제
          </button>
        </div>
      </article>
    </li>
  );
}
