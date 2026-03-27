"use client";

import type { ReactNode } from "react";
import { Modal } from "./libs/modal";
import { cn } from "@shared/lib/style-utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  confirmTone?: "default" | "danger";
  isPending?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "확인",
  confirmTone = "default",
  isPending,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} withBackground>
      <div className="flex flex-col gap-5 p-6 text-left">
        <h2 className="text-base font-semibold text-text-1">{title}</h2>

        {children ? (
          <div className="text-sm text-text-2">{children}</div>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              "inline-flex items-center justify-center rounded-[0.75rem] px-4 py-2.5 text-sm font-semibold transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              confirmTone === "danger"
                ? "bg-negative-1 text-white hover:opacity-90"
                : "bg-primary-1 text-white hover:opacity-90",
            )}
          >
            {isPending ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
