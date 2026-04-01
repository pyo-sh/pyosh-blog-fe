"use client";

import { MarkdownPreview } from "./markdown-preview";
import { Modal } from "@shared/ui/libs";

interface PreviewModalProps {
  isOpen: boolean;
  title?: string;
  value: string;
  onClose: () => void;
}

export function PreviewModal({
  isOpen,
  title,
  value,
  onClose,
}: PreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      withBackground
      aria-label="마크다운 미리보기"
    >
      <div className="flex h-[min(88vh,60rem)] w-[min(94vw,76rem)] flex-col overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-1 text-left shadow-[0px_28px_90px_0px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-border-3 bg-background-2 px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-4">실제 글 미리보기</p>
            <h2 className="mt-1 truncate text-base font-semibold text-text-1">
              {title?.trim() || "제목 없음"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[0.9rem] border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
          >
            닫기
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <MarkdownPreview
            value={value}
            className="h-full min-h-0"
            showHeader={false}
          />
        </div>
      </div>
    </Modal>
  );
}
