"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Post } from "@entities/post";
import { deletePost, updatePost } from "@entities/post";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";
import { ConfirmDialog } from "@shared/ui/confirm-dialog";
import { ToggleSwitch } from "@shared/ui/toggle-switch";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toDatetimeLocalValue(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

interface PostPreviewProps {
  post: Post;
  renderedContent: string;
}

const statusOptions: Array<{
  label: string;
  value: Post["status"];
}> = [
  { label: "초안", value: "draft" },
  { label: "발행", value: "published" },
  { label: "보관", value: "archived" },
];

export function PostPreview({ post, renderedContent }: PostPreviewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentPost, setCurrentPost] = useState(post);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modifiedAtInput, setModifiedAtInput] = useState(
    toDatetimeLocalValue(post.contentModifiedAt),
  );

  const updateMutation = useMutation({
    mutationFn: (body: Parameters<typeof updatePost>[1]) =>
      updatePost(currentPost.id, body),
    onSuccess: (updated) => {
      setCurrentPost(updated);
      setModifiedAtInput(toDatetimeLocalValue(updated.contentModifiedAt));
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "수정에 실패했습니다."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(currentPost.id),
    onSuccess: () => {
      toast.success("글이 삭제되었습니다.");
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      router.push("/manage/posts");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "삭제에 실패했습니다."));
    },
  });

  const isUpdating = updateMutation.isPending;

  function updateModifiedAt(nextValue: string | null) {
    const previousValue = currentPost.contentModifiedAt;
    const previousInput = modifiedAtInput;

    setCurrentPost((prev) => ({ ...prev, contentModifiedAt: nextValue }));
    setModifiedAtInput(toDatetimeLocalValue(nextValue));

    updateMutation.mutate(
      { contentModifiedAt: nextValue },
      {
        onError: () => {
          setCurrentPost((prev) => ({
            ...prev,
            contentModifiedAt: previousValue,
          }));
          setModifiedAtInput(previousInput);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-[1.75rem] border border-border-3 bg-background-2 p-4 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)]">
        <Link
          href="/manage/posts"
          className="inline-flex items-center gap-1.5 rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          ← 목록
        </Link>

        <Link
          href={`/manage/posts/${currentPost.id}/edit`}
          className="inline-flex items-center rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          수정
        </Link>

        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleteMutation.isPending}
          className="inline-flex items-center rounded-[0.75rem] border border-negative-1/30 px-3 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:opacity-50"
        >
          삭제
        </button>

        <div className="flex items-center gap-2 text-sm text-text-2">
          <span>공개</span>
          <ToggleSwitch
            checked={currentPost.visibility === "public"}
            disabled={isUpdating}
            onChange={(checked) => {
              const prev = currentPost.visibility;
              setCurrentPost((p) => ({
                ...p,
                visibility: checked ? "public" : "private",
              }));
              updateMutation.mutate(
                { visibility: checked ? "public" : "private" },
                {
                  onError: () =>
                    setCurrentPost((p) => ({ ...p, visibility: prev })),
                },
              );
            }}
            aria-label={currentPost.visibility === "public" ? "공개" : "비공개"}
          />
        </div>

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => {
            const prev = currentPost.isPinned;
            setCurrentPost((p) => ({ ...p, isPinned: !p.isPinned }));
            updateMutation.mutate(
              { isPinned: !currentPost.isPinned },
              {
                onError: () =>
                  setCurrentPost((p) => ({ ...p, isPinned: prev })),
              },
            );
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[0.75rem] border px-3 py-2 text-sm font-medium transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            currentPost.isPinned
              ? "border-primary-1/30 text-primary-1 hover:bg-primary-1/10"
              : "border-border-3 text-text-2 hover:border-border-2 hover:text-text-1",
          )}
          aria-label={currentPost.isPinned ? "고정 해제" : "글 고정"}
        >
          {currentPost.isPinned ? "📌 고정됨" : "고정"}
        </button>

        <div className="flex items-center gap-2 text-sm text-text-2">
          <span>상태</span>
          <select
            value={currentPost.status}
            disabled={isUpdating}
            onChange={(e) => {
              const value = e.target.value as Post["status"];
              const prev = currentPost.status;
              setCurrentPost((p) => ({ ...p, status: value }));
              updateMutation.mutate(
                { status: value },
                {
                  onError: () =>
                    setCurrentPost((p) => ({ ...p, status: prev })),
                },
              );
            }}
            className="rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 disabled:opacity-50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-text-2">
          <span>수정일</span>
          <input
            type="datetime-local"
            value={modifiedAtInput}
            disabled={isUpdating}
            onChange={(event) => setModifiedAtInput(event.target.value)}
            className="rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 disabled:opacity-50"
            aria-label="수정일 설정"
          />
          <button
            type="button"
            disabled={isUpdating || !modifiedAtInput}
            onClick={() =>
              updateModifiedAt(fromDatetimeLocalValue(modifiedAtInput))
            }
            className="inline-flex items-center rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            적용
          </button>
          <button
            type="button"
            disabled={isUpdating || currentPost.contentModifiedAt === null}
            onClick={() => updateModifiedAt(null)}
            className="inline-flex items-center rounded-[0.75rem] border border-border-3 px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            수정일 제거
          </button>
        </div>
      </div>

      {/* Preview content */}
      <div className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)]">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-text-3">
          {currentPost.category ? (
            <span className="font-medium text-primary-1">
              {currentPost.category.name}
            </span>
          ) : null}
          {currentPost.publishedAt ? (
            <span>
              {dateFormatter.format(new Date(currentPost.publishedAt))}
            </span>
          ) : null}
          {currentPost.contentModifiedAt ? (
            <span>
              수정{" "}
              {dateFormatter.format(new Date(currentPost.contentModifiedAt))}
            </span>
          ) : null}
          <span>조회 {currentPost.totalPageviews}</span>
          <span>댓글 {currentPost.commentCount}</span>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-text-1">
          {currentPost.title}
        </h1>

        <div
          className="markdown-content prose max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {currentPost.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-border-3 pt-4">
            {currentPost.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-border-3 px-3 py-1 text-xs text-text-3"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteMutation.mutate()}
        title={`"${currentPost.title}" 글을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        confirmTone="danger"
        isPending={deleteMutation.isPending}
      >
        <p>삭제된 글은 휴지통에서 복원할 수 있습니다.</p>
      </ConfirmDialog>
    </div>
  );
}
