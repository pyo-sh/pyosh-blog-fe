"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import altArrowDownLinear from "@iconify-icons/solar/alt-arrow-down-linear";
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

function BulkSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string; depth?: number }>;
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-8 w-full items-center rounded-md border border-border-3 bg-background-1 px-2.5 py-[5px] pr-7 text-left text-[12px] font-normal leading-none text-text-1 outline-none transition-colors",
          open && "border-primary-1 ring-3 ring-primary-1/10",
        )}
      >
        <span className="truncate whitespace-nowrap">
          {selectedOption?.label ?? ""}
        </span>
        <Icon
          icon={altArrowDownLinear}
          width="12"
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-4 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[200] min-w-full overflow-hidden rounded-lg border border-border-3 bg-background-1 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
          <div role="listbox" aria-label={ariaLabel} className="py-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center whitespace-nowrap px-3 py-2 text-left text-[12px] leading-none text-text-1 transition-colors hover:bg-background-2",
                    isSelected && "font-medium text-primary-1",
                  )}
                  style={{
                    paddingLeft: option.depth
                      ? `${12 + option.depth * 16}px`
                      : undefined,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
  const categoryOptions = useMemo(
    () => [
      { label: "카테고리", value: "" },
      ...flatCategories.map(({ category, depth }) => ({
        label: category.name,
        value: String(category.id),
        depth,
      })),
    ],
    [flatCategories],
  );
  const commentStatusOptions = useMemo(
    () => [
      { label: "댓글 상태", value: "" },
      ...COMMENT_STATUS_OPTIONS,
    ],
    [],
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
        <label className="flex items-center gap-2 text-body-sm font-medium leading-none text-text-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="h-4 w-4 rounded border-border-3 accent-primary-1"
          />
          <span className="leading-none">전체</span>
          <span className="ml-1 text-body-sm font-semibold leading-none text-primary-1">
            선택됨 {count}개
          </span>
        </label>

        <div className="hidden h-6 w-px bg-border-3 md:block" />

        {tab === "active" ? (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <BulkSelect
              value={categoryId ? String(categoryId) : ""}
              onChange={(value) =>
                setCategoryId(value ? Number(value) : undefined)
              }
              options={categoryOptions}
              ariaLabel="일괄 카테고리 변경"
              className="min-w-[8rem]"
            />

            <BulkSelect
              value={commentStatus ?? ""}
              onChange={(value) =>
                setCommentStatus(
                  (value as "open" | "locked" | "disabled") || undefined,
                )
              }
              options={commentStatusOptions}
              ariaLabel="일괄 댓글 상태 변경"
              className="min-w-[8rem]"
            />

            <button
              type="button"
              onClick={() => {
                setCategoryId(undefined);
                setCommentStatus(undefined);
              }}
              aria-label="일괄 변경 초기화"
              disabled={!hasUpdate}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-3 text-text-2 transition-colors hover:bg-background-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon={restartLinear} width="16" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setShowApplyDialog(true)}
              disabled={!hasUpdate || isPending}
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-md border px-3 text-[12px] font-medium leading-none transition-colors",
                hasUpdate
                  ? "border-primary-1 bg-primary-1 text-white hover:opacity-90"
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
              className="inline-flex h-8 items-center justify-center rounded-md border border-negative-1 bg-negative-1 px-3 text-[12px] font-medium leading-none text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
