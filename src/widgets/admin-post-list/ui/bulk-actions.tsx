"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import restartLinear from "@iconify-icons/solar/restart-linear";
import type { AdminPostTab } from "./post-filters";
import type { Category } from "@entities/category";
import { cn } from "@shared/lib/style-utils";
import { ConfirmDialog } from "@shared/ui/confirm-dialog";

interface BulkActionsProps {
  tab: AdminPostTab;
  selectedIds: number[];
  allSelected: boolean;
  categories: Category[];
  onSelectAll: () => void;
  onBulkDelete: (ids: number[]) => Promise<void>;
  onBulkRestore: (ids: number[]) => Promise<void>;
  onBulkHardDelete: (ids: number[]) => Promise<void>;
  onBulkUpdate: (
    ids: number[],
    categoryId?: number,
    commentStatus?: "open" | "locked" | "disabled",
  ) => Promise<void>;
  onClearSelection: () => void;
}

const COMMENT_STATUS_OPTIONS: Array<{
  label: string;
  value: "open" | "locked" | "disabled";
}> = [
  { label: "열림", value: "open" },
  { label: "잠김", value: "locked" },
  { label: "닫힘", value: "disabled" },
];

const COMMENT_STATUS_DESC: Record<"open" | "locked" | "disabled", string> = {
  open: "댓글 작성과 표시가 정상 동작합니다.",
  locked: "기존 댓글은 유지되며 새 댓글 작성이 차단됩니다.",
  disabled: "댓글 영역이 완전히 숨겨집니다.",
};

function buildCategoryTree(
  categories: Category[],
  parentId: number | null = null,
  depth = 0,
): Array<{ category: Category; depth: number }> {
  const result: Array<{ category: Category; depth: number }> = [];
  const children = categories.filter(
    (category) => category.parentId === parentId,
  );

  for (const category of children) {
    result.push({ category, depth });
    result.push(...buildCategoryTree(categories, category.id, depth + 1));
  }

  return result;
}

export function BulkActions({
  tab,
  selectedIds,
  allSelected,
  categories,
  onSelectAll,
  onBulkDelete,
  onBulkRestore,
  onBulkHardDelete,
  onBulkUpdate,
  onClearSelection,
}: BulkActionsProps) {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [commentStatus, setCommentStatus] = useState<
    "open" | "locked" | "disabled" | undefined
  >(undefined);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const flatCategories = useMemo(
    () => buildCategoryTree(categories),
    [categories],
  );
  const count = selectedIds.length;
  const hasUpdate = categoryId !== undefined || commentStatus !== undefined;

  if (count === 0) return null;

  async function handleApply() {
    setIsPending(true);
    try {
      await onBulkUpdate(selectedIds, categoryId, commentStatus);
      setCategoryId(undefined);
      setCommentStatus(undefined);
      setShowApplyDialog(false);
      onClearSelection();
    } catch {
      // Parent mutation already handles the error.
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    setIsPending(true);
    try {
      await onBulkDelete(selectedIds);
      setShowDeleteDialog(false);
      onClearSelection();
    } finally {
      setIsPending(false);
    }
  }

  async function handleRestore() {
    setIsPending(true);
    try {
      await onBulkRestore(selectedIds);
      setShowRestoreDialog(false);
      onClearSelection();
    } finally {
      setIsPending(false);
    }
  }

  async function handleHardDelete() {
    setIsPending(true);
    try {
      await onBulkHardDelete(selectedIds);
      setShowHardDeleteDialog(false);
      onClearSelection();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-3 bg-background-2 px-4 py-3">
        <label className="flex items-center gap-2 text-body-sm font-medium text-text-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="h-4 w-4 rounded border-border-3 accent-primary-1"
          />
          <span>전체</span>
          <span className="ml-1 text-body-sm font-semibold text-primary-1">
            선택됨 {count}개
          </span>
        </label>

        <div className="hidden h-6 w-px bg-border-3 md:block" />

        {tab === "active" ? (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <select
              value={categoryId ?? ""}
              onChange={(event) =>
                setCategoryId(
                  event.target.value ? Number(event.target.value) : undefined,
                )
              }
              aria-label="일괄 카테고리 변경"
              className="min-w-[8rem] rounded-lg border border-border-3 bg-background-1 px-3 py-2 text-body-sm text-text-1 outline-none transition-colors focus:border-primary-1 focus:ring-3 focus:ring-primary-1/10"
            >
              <option value="">카테고리</option>
              {flatCategories.map(({ category, depth }) => (
                <option key={category.id} value={category.id}>
                  {`${" ".repeat(depth * 2)}${category.name}`}
                </option>
              ))}
            </select>

            <select
              value={commentStatus ?? ""}
              onChange={(event) =>
                setCommentStatus(
                  (event.target.value as "open" | "locked" | "disabled") ||
                    undefined,
                )
              }
              aria-label="일괄 댓글 상태 변경"
              className="min-w-[8rem] rounded-lg border border-border-3 bg-background-1 px-3 py-2 text-body-sm text-text-1 outline-none transition-colors focus:border-primary-1 focus:ring-3 focus:ring-primary-1/10"
            >
              <option value="">댓글 상태</option>
              {COMMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setCategoryId(undefined);
                setCommentStatus(undefined);
              }}
              aria-label="일괄 변경 초기화"
              disabled={!hasUpdate}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-3 text-text-2 transition-colors hover:bg-background-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon={restartLinear} width="16" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setShowApplyDialog(true)}
              disabled={!hasUpdate || isPending}
              className={cn(
                "rounded-lg px-3 py-2 text-body-sm font-medium transition-colors",
                hasUpdate
                  ? "bg-primary-1 text-white hover:opacity-90"
                  : "border border-border-3 text-text-3",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              적용
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
              className="rounded-lg bg-negative-1 px-3 py-2 text-body-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRestoreDialog(true)}
              disabled={isPending}
              className="rounded-lg border border-border-3 px-3 py-2 text-body-sm font-medium text-text-2 transition-colors hover:bg-background-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              일괄 복원
            </button>
            <button
              type="button"
              onClick={() => setShowHardDeleteDialog(true)}
              disabled={isPending}
              className="rounded-lg bg-negative-1 px-3 py-2 text-body-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              일괄 영구 삭제
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showApplyDialog}
        onClose={() => setShowApplyDialog(false)}
        onConfirm={handleApply}
        title={`${count}개 글에 다음 변경을 적용합니다.`}
        confirmLabel="적용"
        isPending={isPending}
      >
        <ul className="space-y-2">
          {categoryId !== undefined ? (
            <li>
              카테고리:{" "}
              <span className="font-medium text-text-1">
                {flatCategories.find((item) => item.category.id === categoryId)
                  ?.category.name ?? categoryId}
              </span>
            </li>
          ) : null}
          {commentStatus !== undefined ? (
            <li>
              <div>
                댓글 상태:{" "}
                <span className="font-medium text-text-1">
                  {
                    COMMENT_STATUS_OPTIONS.find(
                      (option) => option.value === commentStatus,
                    )?.label
                  }
                </span>
              </div>
              <p className="mt-1 text-ui-xs text-text-4">
                {COMMENT_STATUS_DESC[commentStatus]}
              </p>
            </li>
          ) : null}
        </ul>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`선택한 ${count}개 글을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        confirmTone="danger"
        isPending={isPending}
      >
        <p>삭제된 글은 휴지통에서 복원할 수 있습니다.</p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={showRestoreDialog}
        onClose={() => setShowRestoreDialog(false)}
        onConfirm={handleRestore}
        title={`선택한 ${count}개 글을 복원하시겠습니까?`}
        confirmLabel="복원"
        isPending={isPending}
      >
        <p>복원된 글은 활성 글 탭에 다시 표시됩니다.</p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={showHardDeleteDialog}
        onClose={() => setShowHardDeleteDialog(false)}
        onConfirm={handleHardDelete}
        title={`${count}개의 글을 영구 삭제합니다.`}
        confirmLabel="영구 삭제"
        confirmTone="danger"
        isPending={isPending}
      >
        <div className="space-y-2">
          <p>다음 데이터가 함께 삭제됩니다:</p>
          <ul className="list-disc space-y-1 pl-4 text-text-3">
            <li>관련 댓글 전체</li>
            <li>조회수 기록</li>
            <li>사용되지 않는 태그</li>
          </ul>
          <p className="font-medium text-negative-1">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
      </ConfirmDialog>
    </>
  );
}
