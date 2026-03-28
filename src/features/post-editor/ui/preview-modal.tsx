"use client";

import { MarkdownPreview } from "./markdown-preview";
import { Modal } from "@shared/ui/libs";

interface PreviewModalProps {
  isOpen: boolean;
  value: string;
  onClose: () => void;
}

export function PreviewModal({ isOpen, value, onClose }: PreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} withBackground>
      <div className="flex h-[min(88vh,60rem)] w-[min(92vw,72rem)] flex-col overflow-hidden rounded-[1.5rem] bg-background-1 text-left">
        <div className="flex items-center justify-between border-b border-border-3 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-text-4">
              Preview
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-1">
              마크다운 미리보기
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

        <div className="min-h-0 flex-1 px-6 py-6">
          <MarkdownPreview
            value={value}
            className="h-full min-h-0"
            headerTitle="Modal Preview"
          />
        </div>
      </div>
    </Modal>
  );
}
