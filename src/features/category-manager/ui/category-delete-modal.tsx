"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, DeleteCategoryOptions } from "@entities/category";
import { cn } from "@shared/lib/style-utils";
import { Modal, Spinner } from "@shared/ui/libs";

interface CategoryDeleteModalProps {
  category: Category | null;
  categories: Category[];
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: (options: DeleteCategoryOptions) => void;
}

type DeleteMode = DeleteCategoryOptions["action"] | null;

export function CategoryDeleteModal({
  category,
  categories,
  isDeleting,
  onCancel,
  onConfirm,
}: CategoryDeleteModalProps) {
  const [mode, setMode] = useState<DeleteMode>(null);
  const [moveTo, setMoveTo] = useState<number | null>(null);

  useEffect(() => {
    if (!category) {
      return;
    }

    if ((category.totalPostCount ?? 0) > 0) {
      setMode(null);
      setMoveTo(null);

      return;
    }

    setMode("trash");
    setMoveTo(null);
  }, [category]);

  const moveOptions = useMemo(() => {
    if (!category) {
      return [];
    }

    return flattenCategories(categories)
      .filter((option) => option.id !== category.id)
      .map(({ id, name, depth }) => ({
        id,
        label: `${"— ".repeat(depth)}${name}`,
      }));
  }, [categories, category]);

  const hasChildren = Boolean(category?.children?.length);
  const postCount = category?.totalPostCount ?? 0;
  const requiresMoveTarget =
    postCount > 0 && mode === "move" && moveTo === null;
  const isConfirmDisabled =
    isDeleting || (postCount > 0 && (mode === null || requiresMoveTarget));

  return (
    <Modal
      isOpen={Boolean(category)}
      onClose={() => {
        if (!isDeleting) {
          onCancel();
        }
      }}
      withBackground
      aria-label="카테고리 삭제"
      className="w-[min(100%,34rem)] p-0 text-left"
    >
      <div className="border-b border-border-3 px-6 py-5">
        <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
          Delete category
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-1">
          {hasChildren ? "삭제 불가" : "카테고리 삭제"}
        </h2>
      </div>

      {hasChildren ? (
        <div className="space-y-3 px-6 py-5">
          <p className="text-sm leading-6 text-text-2">
            하위 카테고리가 있는 항목은 삭제할 수 없습니다.
          </p>
          <p className="text-sm leading-6 text-text-3">
            하위 카테고리를 먼저 삭제하거나 다른 위치로 이동해 주세요.
          </p>
        </div>
      ) : (
        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            {postCount > 0 ? (
              <>
                <p className="text-sm leading-6 text-text-2">
                  <strong className="font-semibold text-text-1">
                    {category?.name}
                  </strong>
                  카테고리에 {postCount}개의 글이 있습니다.
                </p>
                <p className="text-sm leading-6 text-text-3">
                  삭제 전에 글 처리 방식을 선택해야 합니다.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-text-2">
                  <strong className="font-semibold text-text-1">
                    {category?.name}
                  </strong>
                  을(를) 삭제하시겠습니까?
                </p>
                <p className="text-sm leading-6 text-text-3">
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </>
            )}
          </div>

          {postCount > 0 ? (
            <fieldset className="space-y-3">
              <legend className="sr-only">삭제 전 글 처리 방식 선택</legend>

              <label
                className={cn(
                  "flex cursor-pointer gap-4 rounded-[1rem] border px-4 py-4 transition-colors",
                  mode === "move"
                    ? "border-primary-1 bg-primary-1/5"
                    : "border-border-3 bg-background-1 hover:border-border-2",
                )}
              >
                <input
                  type="radio"
                  name="category-delete-action"
                  checked={mode === "move"}
                  onChange={() => setMode("move")}
                  disabled={isDeleting}
                  aria-label="다른 카테고리로 이동"
                  className="mt-1 h-4 w-4 border-border-3 accent-primary-1"
                />
                <span className="flex-1 space-y-3">
                  <span className="block">
                    <span className="block text-sm font-semibold text-text-1">
                      다른 카테고리로 이동
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-text-3">
                      삭제 전에 현재 글을 다른 카테고리로 옮깁니다.
                    </span>
                  </span>

                  <select
                    value={moveTo ?? ""}
                    onChange={(event) =>
                      setMoveTo(
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    disabled={isDeleting || mode !== "move"}
                    aria-label="이동 대상 카테고리"
                    className="w-full rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">이동할 카테고리를 선택하세요</option>
                    {moveOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </span>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer gap-4 rounded-[1rem] border px-4 py-4 transition-colors",
                  mode === "trash"
                    ? "border-negative-1/40 bg-negative-1/5"
                    : "border-border-3 bg-background-1 hover:border-border-2",
                )}
              >
                <input
                  type="radio"
                  name="category-delete-action"
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
                    현재 글을 휴지통으로 보낸 뒤 카테고리를 삭제합니다. 복원할
                    때는 카테고리를 다시 지정해야 합니다.
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
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="inline-flex items-center justify-center rounded-[0.75rem] bg-negative-1 px-4 py-2 text-sm font-medium text-text-1 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
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
