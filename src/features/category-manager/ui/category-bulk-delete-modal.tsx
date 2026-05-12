"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, DeleteCategoryOptions } from "@entities/category";
import { cn } from "@shared/lib/style-utils";
import { DropSelect, Modal, Spinner } from "@shared/ui/libs";

interface CategoryBulkDeleteModalProps {
  isOpen: boolean;
  selectedCategories: Category[];
  categories: Category[];
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: (options: DeleteCategoryOptions) => void;
}

type DeleteMode = DeleteCategoryOptions["action"] | null;

export function CategoryBulkDeleteModal({
  isOpen,
  selectedCategories,
  categories,
  isDeleting,
  onCancel,
  onConfirm,
}: CategoryBulkDeleteModalProps) {
  const [mode, setMode] = useState<DeleteMode>(null);
  const [moveTo, setMoveTo] = useState<number | null>(null);

  const selectedIds = useMemo(
    () => new Set(selectedCategories.map((category) => category.id)),
    [selectedCategories],
  );
  const selectedCount = selectedCategories.length;
  const categoriesWithChildren = selectedCategories.filter(
    (category) => (category.children?.length ?? 0) > 0,
  );
  const categoriesWithPosts = selectedCategories.filter(
    (category) => (category.totalPostCount ?? 0) > 0,
  );
  const postCount = categoriesWithPosts.reduce(
    (total, category) => total + (category.totalPostCount ?? 0),
    0,
  );
  const hasChildren = categoriesWithChildren.length > 0;

  useEffect(() => {
    if (!isOpen) {
      setMode(null);
      setMoveTo(null);

      return;
    }

    if (postCount > 0) {
      setMode(null);
      setMoveTo(null);

      return;
    }

    setMode("trash");
    setMoveTo(null);
  }, [isOpen, postCount]);

  const moveOptions = useMemo(
    () =>
      flattenCategories(categories)
        .filter((option) => !selectedIds.has(option.id))
        .map(({ id, name, depth }) => ({
          id,
          label: `${"— ".repeat(depth)}${name}`,
        })),
    [categories, selectedIds],
  );

  const requiresMoveTarget =
    postCount > 0 && mode === "move" && moveTo === null;
  const isConfirmDisabled =
    isDeleting ||
    selectedCount === 0 ||
    hasChildren ||
    (postCount > 0 && (mode === null || requiresMoveTarget));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) {
          onCancel();
        }
      }}
      withBackground
      aria-label="카테고리 일괄 삭제"
      className="w-[min(100%,36rem)] p-0 text-left"
    >
      <div className="border-b border-border-3 px-6 py-5">
        <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
          Delete categories
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-1">
          {hasChildren ? "삭제 불가" : "카테고리 일괄 삭제"}
        </h2>
      </div>

      {hasChildren ? (
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-6 text-text-2">
            선택한 {selectedCount}개 카테고리 중 하위 카테고리가 있는 항목{" "}
            {categoriesWithChildren.length}개는 삭제할 수 없습니다.
          </p>
          <div className="rounded-[0.9rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3">
            <p className="text-sm font-medium text-negative-1">
              하위 카테고리 포함 항목
            </p>
            <p className="mt-2 text-sm leading-6 text-text-2">
              {formatCategoryNames(categoriesWithChildren)}
            </p>
          </div>
          <p className="text-sm leading-6 text-text-3">
            하위 카테고리를 먼저 삭제하거나 다른 위치로 이동한 뒤 다시 시도해
            주세요.
          </p>
        </div>
      ) : (
        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <p className="text-sm leading-6 text-text-2">
              선택한{" "}
              <strong className="font-semibold text-text-1">
                {selectedCount}개
              </strong>{" "}
              카테고리를 삭제합니다.
            </p>
            {postCount > 0 ? (
              <>
                <p className="text-sm leading-6 text-text-2">
                  포함된 글은 총{" "}
                  <strong className="font-semibold text-text-1">
                    {postCount}개
                  </strong>
                  입니다.
                </p>
                <p className="text-sm leading-6 text-text-3">
                  삭제 전에 선택한 카테고리의 글 처리 방식을 선택해야 합니다.
                </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-text-3">
                연결된 글이 없는 카테고리입니다. 이 작업은 되돌릴 수 없습니다.
              </p>
            )}
          </div>

          {postCount > 0 ? (
            <fieldset className="space-y-3">
              <legend className="sr-only">삭제 전 글 처리 방식 선택</legend>

              <label
                className={cn(
                  "flex cursor-pointer gap-4 rounded-2xl border px-4 py-4 transition-colors",
                  mode === "move"
                    ? "border-primary-1 bg-primary-1/5"
                    : "border-border-3 bg-background-1 hover:border-border-2",
                )}
              >
                <input
                  type="radio"
                  name="category-bulk-delete-action"
                  checked={mode === "move"}
                  onChange={() => setMode("move")}
                  disabled={isDeleting || moveOptions.length === 0}
                  aria-label="다른 카테고리로 이동"
                  className="mt-1 h-4 w-4 border-border-3 accent-primary-1"
                />
                <span className="flex-1 space-y-3">
                  <span className="block">
                    <span className="block text-sm font-semibold text-text-1">
                      다른 카테고리로 이동
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-text-3">
                      선택한 카테고리의 글을 삭제 대상이 아닌 카테고리로
                      옮깁니다.
                    </span>
                  </span>

                  <DropSelect
                    value={moveTo === null ? "" : String(moveTo)}
                    onChange={(value) =>
                      setMoveTo(value ? Number(value) : null)
                    }
                    disabled={
                      isDeleting || mode !== "move" || moveOptions.length === 0
                    }
                    ariaLabel="이동 대상 카테고리"
                    className="w-full"
                    triggerClassName="h-auto rounded-[0.9rem] px-4 py-3 text-sm text-text-1"
                    options={[
                      {
                        label:
                          moveOptions.length > 0
                            ? "이동할 카테고리를 선택하세요"
                            : "이동 가능한 카테고리가 없습니다",
                        value: "",
                      },
                      ...moveOptions.map((option) => ({
                        label: option.label,
                        value: String(option.id),
                      })),
                    ]}
                  />
                </span>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer gap-4 rounded-2xl border px-4 py-4 transition-colors",
                  mode === "trash"
                    ? "border-negative-1/40 bg-negative-1/5"
                    : "border-border-3 bg-background-1 hover:border-border-2",
                )}
              >
                <input
                  type="radio"
                  name="category-bulk-delete-action"
                  checked={mode === "trash"}
                  onChange={() => setMode("trash")}
                  disabled={isDeleting}
                  aria-label="글을 휴지통으로 이동"
                  className="mt-1 h-4 w-4 border-border-3 accent-negative-1"
                />
                <span className="block">
                  <span className="block text-sm font-semibold text-text-1">
                    글을 휴지통으로 이동
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-text-3">
                    선택한 카테고리의 글을 휴지통으로 보낸 뒤 카테고리를
                    삭제합니다. 복원할 때는 카테고리를 다시 지정해야 합니다.
                  </span>
                </span>
              </label>
            </fieldset>
          ) : null}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-border-3 px-6 py-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="inline-flex items-center justify-center rounded-xl border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {hasChildren ? "확인" : "취소"}
        </button>
        {!hasChildren ? (
          <button
            type="button"
            onClick={() => {
              if (postCount > 0) {
                if (mode === "move" && moveTo !== null) {
                  onConfirm({ action: "move", moveTo });
                }

                if (mode === "trash") {
                  onConfirm({ action: "trash" });
                }

                return;
              }

              onConfirm({ action: "trash" });
            }}
            disabled={isConfirmDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-negative-1 px-4 py-2 text-sm font-medium text-text-1 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" /> 삭제 중
              </>
            ) : (
              "삭제"
            )}
          </button>
        ) : null}
      </div>
    </Modal>
  );
}

function flattenCategories(
  categories: Category[],
  depth = 0,
): Array<{ id: number; name: string; depth: number }> {
  return categories.flatMap((category) => [
    { id: category.id, name: category.name, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

function formatCategoryNames(categories: Category[]) {
  const visibleNames = categories.slice(0, 3).map((category) => category.name);
  const remainingCount = categories.length - visibleNames.length;

  if (remainingCount <= 0) {
    return visibleNames.join(", ");
  }

  return `${visibleNames.join(", ")} 외 ${remainingCount}개`;
}
