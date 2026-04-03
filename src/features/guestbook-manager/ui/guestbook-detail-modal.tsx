"use client";

import type {
  AdminGuestbookDeleteAction,
  AdminGuestbookItem,
  AdminGuestbookPatchAction,
} from "@entities/guestbook";
import { cn } from "@shared/lib/style-utils";
import { Modal } from "@shared/ui/libs";

type GuestbookDetailAction =
  | AdminGuestbookDeleteAction
  | AdminGuestbookPatchAction;

interface GuestbookDetailModalProps {
  item: AdminGuestbookItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: GuestbookDetailAction) => void;
  isPending?: boolean;
}

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function getAvailableActions(status: AdminGuestbookItem["status"]) {
  if (status === "hidden") {
    return [
      { value: "restore" as const, label: "복원", tone: "default" as const },
      {
        value: "soft_delete" as const,
        label: "소프트 삭제",
        tone: "default" as const,
      },
      {
        value: "hard_delete" as const,
        label: "영구 삭제",
        tone: "danger" as const,
      },
    ];
  }

  if (status === "deleted") {
    return [
      { value: "restore" as const, label: "복원", tone: "default" as const },
      {
        value: "hard_delete" as const,
        label: "영구 삭제",
        tone: "danger" as const,
      },
    ];
  }

  return [
    {
      value: "hide" as const,
      label: "비공개 전환",
      tone: "default" as const,
    },
    {
      value: "soft_delete" as const,
      label: "소프트 삭제",
      tone: "default" as const,
    },
    {
      value: "hard_delete" as const,
      label: "영구 삭제",
      tone: "danger" as const,
    },
  ];
}

export function GuestbookDetailModal({
  item,
  isOpen,
  onClose,
  onSelectAction,
  isPending = false,
}: GuestbookDetailModalProps) {
  if (!item) {
    return null;
  }

  const actions = getAvailableActions(item.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      withBackground
      aria-label="방명록 상세 보기"
      className="w-full max-w-[35rem]"
    >
      <div className="flex max-h-[80vh] flex-col text-left">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-bold text-text-1">방명록 상세</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3 hover:text-text-1"
            aria-label="방명록 상세 닫기"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background-3 text-sm font-semibold text-text-2">
              {item.author.name.trim().charAt(0) || "?"}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-1">
                {item.author.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-3">
                  {item.author.type === "guest" && item.author.email
                    ? item.author.email
                    : item.author.type === "oauth"
                      ? "OAuth"
                      : "-"}
                </span>
                <span className="text-xs text-text-4">|</span>
                <span className="text-xs text-text-4">
                  {dateTimeFormatter.format(new Date(item.createdAt))}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4 border-b border-border-4" />

          <p
            className={cn(
              "mb-5 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-2",
              item.status === "deleted" && "text-text-4",
            )}
          >
            {item.body || "삭제된 방명록입니다."}
          </p>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="whitespace-nowrap text-xs text-text-3">상태:</span>
            <span
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium leading-none",
                item.status === "active" && "bg-positive-1/10 text-positive-1",
                item.status === "hidden" && "bg-background-3 text-text-3",
                item.status === "deleted" && "bg-negative-1/10 text-negative-1",
              )}
            >
              {item.status === "active"
                ? "정상"
                : item.status === "hidden"
                  ? "숨김"
                  : "삭제"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 px-6 pb-5">
          {actions.map((action) => (
            <button
              key={action.value}
              type="button"
              onClick={() => onSelectAction(action.value)}
              disabled={isPending}
              className={cn(
                "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[0.75rem] px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                action.tone === "danger"
                  ? "bg-negative-1 text-white hover:opacity-90"
                  : "border border-border-3 text-text-2 hover:border-border-2 hover:text-text-1",
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
