"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AdminCommentBulkAction,
  AdminCommentDeleteAction,
} from "@entities/comment";
import { cn } from "@shared/lib/style-utils";
import { Modal } from "@shared/ui/libs";

export type CommentManageAction =
  | AdminCommentBulkAction
  | AdminCommentDeleteAction;

interface CommentDeleteModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  count: number;
  cascadeCount?: number;
  allowedActions: CommentManageAction[];
  defaultAction?: CommentManageAction;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (action: CommentManageAction) => void | Promise<void>;
}

interface ActionOption {
  value: CommentManageAction;
  label: string;
  description: string;
  tone?: "default" | "danger";
}

const OPTION_MAP: Record<CommentManageAction, Omit<ActionOption, "value">> = {
  restore: {
    label: "복원",
    description: "숨김 또는 삭제된 댓글을 다시 정상 상태로 되돌립니다.",
  },
  soft_delete: {
    label: "소프트 삭제",
    description:
      '댓글 본문은 보존한 채 공개 페이지에는 "삭제된 댓글입니다"로 표시합니다.',
  },
  hard_delete: {
    label: "영구 삭제",
    description: "댓글을 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다.",
    tone: "danger",
  },
};

function buildOptions(
  actions: CommentManageAction[],
  count: number,
  cascadeCount?: number,
): ActionOption[] {
  return actions.map((action) => {
    const option = OPTION_MAP[action];

    if (action !== "hard_delete") {
      return { value: action, ...option };
    }

    const countLabel = count > 1 ? `선택한 ${count}개 댓글` : "선택한 댓글";
    const cascadeLabel =
      cascadeCount && cascadeCount > 0
        ? ` 대댓글 ${cascadeCount}개도 함께 삭제됩니다.`
        : "";

    return {
      value: action,
      ...option,
      description: `${countLabel}을 완전히 삭제합니다.${cascadeLabel}`,
    };
  });
}

export function CommentDeleteModal({
  isOpen,
  title,
  description,
  count,
  cascadeCount,
  allowedActions,
  defaultAction,
  isPending = false,
  onClose,
  onConfirm,
}: CommentDeleteModalProps) {
  const options = useMemo(
    () => buildOptions(allowedActions, count, cascadeCount),
    [allowedActions, cascadeCount, count],
  );
  const [selectedAction, setSelectedAction] =
    useState<CommentManageAction | null>(
      defaultAction ?? options[0]?.value ?? null,
    );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedAction(defaultAction ?? options[0]?.value ?? null);
  }, [defaultAction, isOpen, options]);

  if (!isOpen) {
    return null;
  }

  const selectedOption =
    options.find((option) => option.value === selectedAction) ?? options[0];
  const handleClose = () => {
    if (isPending) {
      return;
    }

    onClose();
  };
  const confirmLabel = selectedOption?.label ?? "확인";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      withBackground
      aria-label={title}
      className="w-full max-w-[34rem] overflow-hidden"
    >
      <div className="max-h-[85vh] overflow-y-auto p-6 text-left">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text-1">{title}</h2>
          {description ? (
            <p className="text-sm leading-6 text-text-3">{description}</p>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          {options.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer gap-4 rounded-[1rem] border px-4 py-4 transition-colors",
                selectedAction === option.value
                  ? "border-primary-1 bg-primary-1/5"
                  : "border-border-3 bg-background-1 hover:border-border-2",
              )}
            >
              <input
                type="radio"
                name="comment-action"
                checked={selectedAction === option.value}
                onChange={() => setSelectedAction(option.value)}
                className="mt-1 h-4 w-4 border-border-3 accent-primary-1"
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-text-1">
                  {option.label}
                </span>
                <span className="block text-sm leading-6 text-text-3">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedOption) {
                void onConfirm(selectedOption.value);
              }
            }}
            disabled={!selectedOption || isPending}
            className={cn(
              "inline-flex items-center justify-center rounded-[0.75rem] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
              selectedOption?.tone === "danger"
                ? "bg-negative-1"
                : "bg-primary-1",
            )}
          >
            {isPending ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
