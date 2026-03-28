"use client";

import { Modal } from "@shared/ui/libs";

interface PublishConfirmModalProps {
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PublishConfirmModal({
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: PublishConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      withBackground
      aria-label="게시글 발행 확인"
    >
      <div className="w-full max-w-xl rounded-[1.5rem] bg-background-1 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-text-4">
            Publish
          </p>
          <h2 className="text-xl font-semibold text-text-1">
            이 글을 발행하시겠습니까?
          </h2>
          <p className="text-sm leading-6 text-text-3">
            발행하면 공개 상태와 본문 메타데이터가 함께 저장됩니다.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[0.9rem] border border-border-3 px-4 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="rounded-[0.9rem] bg-primary-1 px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          >
            발행
          </button>
        </div>
      </div>
    </Modal>
  );
}
