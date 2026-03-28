"use client";

import Link from "next/link";
import type { AdminCommentItem } from "@entities/comment";
import { cn } from "@shared/lib/style-utils";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

const statusLabelMap: Record<AdminCommentItem["status"], string> = {
  active: "정상",
  deleted: "삭제됨",
  hidden: "숨김",
};

interface CommentTableProps {
  rows: AdminCommentItem[];
  selectedIds: Set<number>;
  deletingId: number | null;
  onToggleSelect: (item: AdminCommentItem) => void;
  onToggleSelectPage: (ids: number[]) => void;
  onClickComment: (comment: AdminCommentItem) => void;
  onManage: (item: AdminCommentItem) => void;
}

export function CommentTable({
  rows,
  selectedIds,
  deletingId,
  onToggleSelect,
  onToggleSelectPage,
  onClickComment,
  onManage,
}: CommentTableProps) {
  const pageIds = rows.map((r) => r.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected =
    !allPageSelected && pageIds.some((id) => selectedIds.has(id));

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border-3">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-background-2">
          <thead className="bg-background-1 text-left text-xs uppercase tracking-[0.18em] text-text-4">
            <tr>
              <th className="px-4 py-4 font-medium">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
                  onChange={() => onToggleSelectPage(pageIds)}
                  className="h-4 w-4 rounded border-border-3 accent-primary-1"
                  aria-label="현재 페이지 전체 선택"
                />
              </th>
              <th className="px-4 py-4 font-medium">작성자</th>
              <th className="px-4 py-4 font-medium">내용</th>
              <th className="px-4 py-4 font-medium">글 제목</th>
              <th className="px-4 py-4 font-medium">
                <span aria-hidden="true">🔒</span>
                <span className="sr-only">비밀 여부</span>
              </th>
              <th className="px-4 py-4 font-medium">상태</th>
              <th className="px-4 py-4 font-medium">날짜</th>
              <th className="px-4 py-4 font-medium">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-3">
            {rows.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const authorLabel =
                item.author.type === "oauth" ? "OAuth" : "게스트";
              const isReply = item.depth > 0;

              return (
                <tr
                  key={item.id}
                  className={cn(
                    "align-top transition-colors",
                    isSelected && "bg-primary-1/5",
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item)}
                      className="h-4 w-4 rounded border-border-3 accent-primary-1"
                      aria-label={`댓글 ${item.id} 선택`}
                    />
                  </td>

                  {/* Author */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="whitespace-nowrap text-sm font-medium text-text-1">
                        {isReply ? (
                          <span className="mr-0.5 text-text-4">↳</span>
                        ) : null}
                        {item.author.name}
                      </span>
                      <span className="inline-flex w-fit items-center rounded-full bg-background-3 px-2 py-0.5 text-xs text-text-3">
                        {authorLabel}
                      </span>
                    </div>
                  </td>

                  {/* Body - clickable */}
                  <td className="px-4 py-4">
                    <div className="max-w-xs space-y-1">
                      <button
                        type="button"
                        onClick={() => onClickComment(item)}
                        className="block w-full truncate text-left text-sm text-text-2 transition-colors hover:text-primary-1"
                        title="클릭하여 상세 보기"
                      >
                        {item.replyToName ? (
                          <span className="text-text-4">
                            @{item.replyToName}{" "}
                          </span>
                        ) : null}
                        {item.body}
                      </button>
                    </div>
                  </td>

                  {/* Post title */}
                  <td className="px-4 py-4">
                    {item.post ? (
                      <Link
                        href={`/manage/posts/${item.postId}/preview`}
                        className="line-clamp-2 max-w-[10rem] text-sm text-primary-1 transition-colors hover:text-primary-2"
                      >
                        {item.post.title}
                      </Link>
                    ) : (
                      <span className="text-sm text-text-4">삭제된 글</span>
                    )}
                  </td>

                  {/* Secret */}
                  <td className="px-4 py-4 text-center">
                    {item.isSecret ? (
                      <span
                        className="text-sm text-primary-1"
                        title="비밀 댓글"
                      >
                        🔒
                      </span>
                    ) : null}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        item.status === "active" &&
                          "bg-positive-1/10 text-positive-1",
                        item.status === "deleted" &&
                          "bg-negative-1/10 text-negative-1",
                        item.status === "hidden" &&
                          "bg-background-3 text-text-3",
                      )}
                    >
                      {statusLabelMap[item.status]}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-text-3">
                    {formatDate(item.createdAt)}
                  </td>

                  {/* Delete action */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => onManage(item)}
                      className={cn(
                        "inline-flex items-center justify-center rounded-[0.75rem] border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        item.status === "deleted" || item.status === "hidden"
                          ? "border-border-3 text-text-2 hover:border-border-2 hover:text-text-1"
                          : "border-negative-1/30 text-negative-1 hover:bg-negative-1/10",
                      )}
                    >
                      {deletingId === item.id
                        ? "처리 중"
                        : item.status === "deleted" || item.status === "hidden"
                          ? "관리"
                          : "삭제"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
