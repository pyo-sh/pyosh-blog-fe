"use client";

import { useEffect, useState } from "react";
import type {
  AdminGuestbookDeleteAction,
  AdminGuestbookPatchAction,
} from "@entities/guestbook";
import { cn } from "@shared/lib/style-utils";
import { Modal } from "@shared/ui/libs";

export type GuestbookManageAction =
  | AdminGuestbookDeleteAction
  | AdminGuestbookPatchAction;

interface GuestbookActionOption {
  value: GuestbookManageAction;
  label: string;
  description: string;
  tone?: "default" | "danger";
}

interface GuestbookActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: GuestbookManageAction) => void | Promise<void>;
  options: GuestbookActionOption[];
  defaultAction?: GuestbookManageAction;
  title: string;
  description?: string;
  confirmLabel?: string;
  isPending?: boolean;
}

export function GuestbookActionModal({
  isOpen,
  onClose,
  onConfirm,
  options,
  defaultAction,
  title,
  description,
  confirmLabel = "확인",
  isPending = false,
}: GuestbookActionModalProps) {
  const [selectedAction, setSelectedAction] =
    useState<GuestbookManageAction | null>(
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      withBackground
      className="w-full max-w-[34rem]"
    >
      <div className="flex flex-col gap-5 p-6 text-left">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text-1">{title}</h2>
          {description ? (
            <p className="text-sm leading-6 text-text-3">{description}</p>
          ) : null}
        </div>

        <div className="space-y-3">
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
                name="guestbook-action"
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

        <div className="flex justify-end gap-3">
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
