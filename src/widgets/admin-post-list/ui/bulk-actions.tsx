"use client";

import { useState } from "react";
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
  { label: "비활성", value: "disabled" },
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
  const children = categories.filter((c) => c.parentId === parentId);
  for (const child of children) {
    result.push({ category: child, depth });
    result.push(...buildCategoryTree(categories, child.id, depth + 1));
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

  const count = selectedIds.length;
  const hasUpdate = categoryId !== undefined || commentStatus !== undefined;
  const flatCategories = buildCategoryTree(categories);

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
      // Parent already toasted; keep dialog open so user can retry.
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
    } catch {
      // Parent already toasted; keep dialog open so user can retry.
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
    } catch {
      // Parent already toasted; keep dialog open so user can retry.
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
    } catch {
      // Parent already toasted; keep dialog open so user can retry.
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-[1rem] border border-primary-1/20 bg-primary-1/5 px-4 py-3">
        <label className="flex items-center gap-2 text-sm font-medium text-text-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="h-4 w-4 rounded border-border-3 accent-primary-1"
          />
          전체
        </label>

        <span className="text-sm text-text-2">선택됨 {count}개</span>

        {tab === "active" ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-4">카테고리:</span>
              <select
                value={categoryId ?? ""}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="rounded-[0.6rem] border border-border-3 bg-background-1 px-2 py-1.5 text-sm text-text-1 outline-none focus:border-primary-1"
              >
                <option value="">-</option>
                {flatCategories.map(({ category, depth }) => (
                  <option key={category.id} value={category.id}>
                    {"\u00A0".repeat(depth * 2)}
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-4">댓글:</span>
              <select
                value={commentStatus ?? ""}
                onChange={(e) =>
                  setCommentStatus(
                    (e.target.value as "open" | "locked" | "disabled") ||
                      undefined,
                  )
                }
                className="rounded-[0.6rem] border border-border-3 bg-background-1 px-2 py-1.5 text-sm text-text-1 outline-none focus:border-primary-1"
              >
                <option value="">-</option>
                {COMMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setCategoryId(undefined);
                setCommentStatus(undefined);
              }}
              disabled={!hasUpdate}
              className="rounded-[0.6rem] border border-border-3 px-2.5 py-1.5 text-sm text-text-3 transition-colors hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="초기화"
            >
              ↺
            </button>

            <button
              type="button"
              onClick={() => setShowApplyDialog(true)}
              disabled={!hasUpdate || isPending}
              className={cn(
                "rounded-[0.6rem] px-3 py-1.5 text-sm font-medium transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                hasUpdate
                  ? "bg-primary-1 text-white hover:opacity-90"
                  : "border border-border-3 text-text-3",
              )}
            >
              적용
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowRestoreDialog(true)}
              disabled={isPending}
              className="rounded-[0.6rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "처리 중..." : "일괄 복원"}
            </button>
            <button
              type="button"
              onClick={() => setShowHardDeleteDialog(true)}
              disabled={isPending}
              className="rounded-[0.6rem] border border-negative-1/30 px-3 py-1.5 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              일괄 영구 삭제
            </button>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {tab === "active" ? (
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
              className="rounded-[0.6rem] border border-negative-1/30 px-3 py-1.5 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              일괄 삭제
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs text-text-4 hover:text-text-2"
          >
            선택 해제
          </button>
        </div>
      </div>

      {/* Apply confirm dialog */}
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
              카테고리: →{" "}
              <span className="font-medium text-text-1">
                {flatCategories.find((f) => f.category.id === categoryId)
                  ?.category.name ?? String(categoryId)}
              </span>
            </li>
          ) : null}
          {commentStatus !== undefined ? (
            <li>
              <div>
                댓글 상태: →{" "}
                <span className="font-medium text-text-1">
                  {
                    COMMENT_STATUS_OPTIONS.find(
                      (o) => o.value === commentStatus,
                    )?.label
                  }
                </span>
              </div>
              <p className="mt-1 text-xs text-text-4">
                &quot;{COMMENT_STATUS_DESC[commentStatus]}&quot;
              </p>
            </li>
          ) : null}
        </ul>
      </ConfirmDialog>

      {/* Soft delete confirm dialog */}
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

      {/* Restore confirm dialog */}
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

      {/* Hard delete confirm dialog */}
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
