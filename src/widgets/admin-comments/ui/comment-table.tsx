"use client";

import { Icon } from "@iconify/react";
import lockKeyholeLinear from "@iconify-icons/solar/lock-keyhole-linear";
import restartLinear from "@iconify-icons/solar/restart-linear";
import trashBinMinimalisticLinear from "@iconify-icons/solar/trash-bin-minimalistic-linear";
import Link from "next/link";
import type { AdminCommentItem } from "@entities/comment";
import { cn } from "@shared/lib/style-utils";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function getAvatarLabel(name: string) {
  return name.trim().charAt(0) || "?";
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
    <div className="overflow-hidden rounded-[1rem] border border-border-4 bg-background-1">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-background-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-text-4">
            <tr>
              <th className="w-10 px-3 py-3.5 font-medium">
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
              <th className="px-3 py-3.5 font-medium">작성자</th>
              <th className="px-3 py-3.5 font-medium">내용</th>
              <th className="px-3 py-3.5 font-medium">게시글</th>
              <th className="px-3 py-3.5 font-medium text-center">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-3 bg-background-1">
                  <Icon icon={lockKeyholeLinear} width="12" />
                </span>
                <span className="sr-only">비밀 여부</span>
              </th>
              <th className="px-3 py-3.5 font-medium">상태</th>
              <th className="px-3 py-3.5 font-medium">작성일</th>
              <th className="px-3 py-3.5 font-medium text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-4">
            {rows.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const authorLabel =
                item.author.type === "oauth" ? "OAuth" : "게스트";
              const isReply = item.depth > 0;

              return (
                <tr
                  key={item.id}
                  className={cn(
                    "align-top transition-colors hover:bg-background-2",
                    isSelected && "bg-primary-1/6",
                  )}
                >
                  <td className="px-3 py-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item)}
                      className="h-4 w-4 rounded border-border-3 accent-primary-1"
                      aria-label={`댓글 ${item.id} 선택`}
                    />
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-3 text-xs font-semibold text-text-2">
                        {getAvatarLabel(item.author.name)}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-text-1">
                            {item.author.name}
                          </span>
                          {isReply ? (
                            <span className="inline-flex items-center rounded-md bg-info-1/10 px-1.5 py-0.5 text-[10px] font-medium text-info-1">
                              답글
                            </span>
                          ) : null}
                        </div>
                        <span className="inline-flex w-fit items-center rounded-md bg-primary-1/10 px-1.5 py-0.5 text-[11px] font-medium text-primary-1">
                          {authorLabel}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="max-w-[22rem]">
                      <button
                        type="button"
                        onClick={() => onClickComment(item)}
                        className="block w-full text-left text-sm leading-6 text-text-2 transition-colors hover:text-primary-1"
                        title="클릭하여 상세 보기"
                      >
                        <span className="line-clamp-1 break-keep">
                          {item.replyToName ? (
                            <span className="font-medium text-text-4">
                              @{item.replyToName}{" "}
                            </span>
                          ) : null}
                          {item.body}
                        </span>
                      </button>
                    </div>
                  </td>

                  <td className="px-3 py-3.5">
                    {item.post ? (
                      <Link
                        href={`/manage/posts/${item.postId}/preview`}
                        className="line-clamp-1 max-w-[12rem] text-sm text-primary-1 transition-colors hover:underline"
                      >
                        {item.post.title}
                      </Link>
                    ) : (
                      <span className="text-sm text-text-4">삭제된 글</span>
                    )}
                  </td>

                  <td className="px-3 py-3.5 text-center">
                    {item.isSecret ? (
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-1/10 text-primary-1"
                        title="비밀 댓글"
                      >
                        <Icon icon={lockKeyholeLinear} width="15" />
                      </span>
                    ) : (
                      <span className="text-sm text-text-4">-</span>
                    )}
                  </td>

                  <td className="px-3 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium",
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

                  <td className="px-3 py-3.5 text-xs whitespace-nowrap text-text-4">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="px-3 py-3.5 text-center">
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => onManage(item)}
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        item.status === "deleted" || item.status === "hidden"
                          ? "text-text-3 hover:bg-background-3 hover:text-text-1"
                          : "text-negative-1 hover:bg-negative-1/10",
                      )}
                      aria-label={
                        item.status === "deleted" || item.status === "hidden"
                          ? "댓글 관리"
                          : "댓글 삭제"
                      }
                    >
                      <Icon
                        icon={
                          item.status === "deleted" || item.status === "hidden"
                            ? restartLinear
                            : trashBinMinimalisticLinear
                        }
                        width="15"
                      />
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
