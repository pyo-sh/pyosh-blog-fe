"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  adminDeleteComment,
  fetchAdminComments,
  type AdminCommentItem,
} from "@entities/comment";
import { formatNumber } from "@shared/lib/format-number";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";
import { Skeleton, Spinner } from "@shared/ui/libs";

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
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        type === "oauth"
          ? "bg-primary-1/10 text-primary-1"
          : "bg-background-3 text-text-3",
      )}
    >
      {type === "oauth" ? "회원" : "비회원"}
    </span>
  );
}

function SecretIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="비밀 댓글"
      className="inline-block text-text-4"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CommentItemSkeleton() {
  return (
    <div className="space-y-2 py-4">
      <div className="flex items-center gap-2">
        <Skeleton height="1.25rem" width="3rem" className="rounded-full" />
        <Skeleton height="1rem" width="5rem" />
        <Skeleton height="1rem" width="4rem" />
        <Skeleton height="1rem" width="3rem" />
      </div>
      <Skeleton height="1rem" />
    </div>
  );
}

function CommentRow({
  item,
  isDeleting,
  onDelete,
}: {
  item: AdminCommentItem;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-3 py-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <AuthorTypeBadge type={item.author.type} />
          <span className="font-medium text-text-1">{item.author.name}</span>
          {item.isSecret ? <SecretIcon /> : null}
          <span className="text-text-4">·</span>
          <Link
            href={`/manage/posts/${item.post.id}/edit`}
            className="truncate text-text-3 transition-colors hover:text-primary-1 hover:underline"
          >
            {item.post.title}
          </Link>
          <span className="text-text-4">·</span>
          <span className="whitespace-nowrap text-text-4">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        {item.replyToName ? (
          <p className="text-xs text-text-4">
            <span className="mr-1">↳</span>
            <span className="font-medium">@{item.replyToName}</span>
          </p>
        ) : null}

        <p className="line-clamp-2 text-sm text-text-2">{item.body}</p>
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label={`"${item.post.title}" 글의 ${item.author.name} 댓글 삭제`}
        className="flex-shrink-0 self-start rounded-[0.75rem] border border-negative-1/30 px-3 py-1.5 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? <Spinner size="sm" /> : "삭제"}
      </button>
    </div>
  );
}

const QUERY_KEY = ["dashboard", "recentComments"] as const;

export function RecentCommentsSection() {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchAdminComments({ limit: 5 }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteComment,
    onMutate: () => {
      setDeleteError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err) => {
      setDeleteError(getErrorMessage(err, "댓글 삭제에 실패했습니다."));
    },
  });

  const comments = data?.data ?? [];
  const totalComments = data?.meta.total ?? 0;
  const activeDeleteId = deleteMutation.variables ?? null;

  return (
    <section
      aria-labelledby="recent-comments-heading"
      className="rounded-[1.5rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
            Recent comments
          </p>
          <h2
            id="recent-comments-heading"
            className="mt-2 text-xl font-semibold text-text-1"
          >
            최근 댓글
            {data ? (
              <span className="ml-2 text-base font-normal text-text-4">
                (총 {formatNumber(totalComments)}개)
              </span>
            ) : null}
          </h2>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div aria-busy="true" className="divide-y divide-border-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CommentItemSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/5 px-4 py-6 text-center">
            <p className="text-sm text-negative-1">
              {getErrorMessage(error, "최근 댓글을 불러오지 못했습니다.")}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          comments.length > 0 ? (
            <div className="divide-y divide-border-3">
              {comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  item={comment}
                  isDeleting={
                    deleteMutation.isPending && activeDeleteId === comment.id
                  }
                  onDelete={() => deleteMutation.mutate(comment.id)}
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-4">
              댓글이 없습니다.
            </p>
          )
        ) : null}
      </div>

      {deleteError ? (
        <p className="mt-3 text-sm text-negative-1">{deleteError}</p>
      ) : null}

      <div className="mt-5 flex justify-end border-t border-border-3 pt-4">
        <Link
          href="/manage/comments"
          className="text-sm font-medium text-primary-1 transition-colors hover:text-primary-2"
        >
          댓글 관리 →
        </Link>
      </div>
    </section>
  );
}
