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

function getStatusLabel(status: AdminGuestbookItem["status"]) {
  if (status === "hidden") {
    return "숨김";
  }

  if (status === "deleted") {
    return "삭제됨";
  }

  return "정상";
}

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
      {
        value: "hard_delete" as const,
        label: "영구 삭제",
        tone: "danger" as const,
      },
    ];
  }

  return [
    { value: "hide" as const, label: "숨기기", tone: "default" as const },
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
      className="w-full max-w-[44rem]"
    >
      <div className="flex max-h-[80vh] flex-col text-left">
        <div className="flex items-start justify-between gap-4 border-b border-border-3 px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-1">방명록 상세</h2>
            <p className="text-sm text-text-3">
              작성자와 원문을 확인하고 상태를 변경할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-3 text-text-3 transition-colors hover:border-border-2 hover:text-text-1"
            aria-label="방명록 상세 닫기"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-6">
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
                작성자
              </dt>
              <dd className="mt-2 text-sm font-medium text-text-1">
                {item.author.name}
                <span className="ml-2 rounded-full bg-background-1 px-2.5 py-1 text-xs font-medium text-text-4">
                  {item.author.type === "oauth" ? "OAuth" : "게스트"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
                이메일
              </dt>
              <dd className="mt-2 text-sm text-text-2">
                {item.author.type === "guest" && item.author.email
                  ? item.author.email
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
                작성일
              </dt>
              <dd className="mt-2 text-sm text-text-2">
                {dateTimeFormatter.format(new Date(item.createdAt))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
                비밀 여부
              </dt>
              <dd className="mt-2 text-sm text-text-2">
                {item.isSecret ? "비밀" : "공개"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
                상태
              </dt>
              <dd className="mt-2 text-sm text-text-2">
                {getStatusLabel(item.status)}
              </dd>
            </div>
          </dl>

          <div className="rounded-[1.25rem] border border-border-3 bg-background-1 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
              본문
            </p>
            <p
              className={cn(
                "mt-4 whitespace-pre-wrap break-words text-sm leading-7",
                item.status === "deleted" ? "text-text-4" : "text-text-2",
              )}
            >
              {item.body || "삭제된 방명록입니다."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-border-3 px-6 py-5">
          {actions.map((action) => (
            <button
              key={action.value}
              type="button"
              onClick={() => onSelectAction(action.value)}
              disabled={isPending}
              className={cn(
                "inline-flex items-center justify-center rounded-[0.75rem] px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                action.tone === "danger"
                  ? "border border-negative-1/30 text-negative-1 hover:bg-negative-1/10"
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
