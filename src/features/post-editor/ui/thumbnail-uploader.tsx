"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AssetPickerModal, uploadAssets } from "@entities/asset";
import { cn } from "@shared/lib/style-utils";
import { Spinner } from "@shared/ui/libs";

interface ThumbnailUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isValidImage(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.has(file.type) && file.size <= MAX_FILE_SIZE;
}

export function ThumbnailUploader({ value, onChange }: ThumbnailUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAwaitingPaste, setIsAwaitingPaste] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState(value);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    setUrlDraft(value);
  }, [value]);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);

      return;
    }

    const nextPreviewUrl = URL.createObjectURL(pendingFile);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [pendingFile]);

  useEffect(() => {
    if (!isAwaitingPaste) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAwaitingPaste(false);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsAwaitingPaste(false);
      }
    };
    const handlePaste = (event: ClipboardEvent) => {
      const imageFile = Array.from(event.clipboardData?.files ?? []).find(
        (file) => file.type.startsWith("image/"),
      );

      if (!imageFile) {
        toast.error("이미지를 복사해 주세요.");

        return;
      }

      if (!isValidImage(imageFile)) {
        toast.error(
          "JPEG, PNG, GIF, WebP, SVG 형식의 10MB 이하 이미지만 가능합니다.",
        );

        return;
      }

      setPendingFile(imageFile);
      setIsAwaitingPaste(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, [isAwaitingPaste]);

  async function uploadFile(file: File) {
    if (!isValidImage(file)) {
      toast.error(
        "JPEG, PNG, GIF, WebP, SVG 형식의 10MB 이하 이미지만 가능합니다.",
      );

      return;
    }

    setIsUploading(true);

    try {
      const [asset] = await uploadAssets([file]);
      onChange(asset.url);
      setPendingFile(null);
      toast.success("썸네일을 업로드했습니다.");
    } catch {
      toast.error("썸네일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2.5" ref={containerRef}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setIsAwaitingPaste(false);
            setIsPickerOpen(true);
          }}
          disabled={isUploading}
          className="h-9 rounded-[0.75rem] border border-border-3 px-3 text-[11px] font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          에셋 갤러리
        </button>
        <button
          type="button"
          onClick={() => setShowUrlInput((current) => !current)}
          className="h-9 rounded-[0.75rem] border border-border-3 px-3 text-[11px] font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          URL 입력
        </button>
        <button
          type="button"
          onClick={() => setIsAwaitingPaste((current) => !current)}
          className={cn(
            "h-9 rounded-[0.75rem] border px-3 text-[11px] font-medium transition-colors",
            isAwaitingPaste
              ? "border-primary-1 bg-primary-1/10 text-primary-1"
              : "border-border-3 text-text-2 hover:border-border-2 hover:text-text-1",
          )}
        >
          {isAwaitingPaste ? "붙여넣기 대기 중..." : "클립보드"}
        </button>
        <button
          type="button"
          onClick={() => {
            onChange("");
            setPendingFile(null);
          }}
          className="h-9 rounded-[0.75rem] border border-negative-1/20 px-3 text-[11px] font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
        >
          삭제
        </button>
      </div>

      {showUrlInput ? (
        <div className="space-y-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(event) => {
              const nextValue = event.target.value;

              setUrlDraft(nextValue);
              onChange(nextValue);
            }}
            placeholder="https://example.com/thumbnail.jpg"
            aria-label="썸네일 URL"
            className="h-10 flex-1 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 text-[13px] text-text-2 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
          />
          <p className="text-[11px] text-text-4">
            URL 입력은 실시간으로 반영됩니다.
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-[13rem] flex-col items-center justify-center rounded-[1rem] border border-dashed bg-background-1 p-4 text-center transition-colors",
          isDragging ? "border-primary-1 bg-primary-1/5" : "border-border-3",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) {
            void uploadFile(file);
          }
        }}
      >
        {previewUrl || value ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote hosts are allowed for admin preview
          <img
            src={previewUrl ?? value}
            alt="썸네일 미리보기"
            className="max-h-44 rounded-[0.85rem] object-cover shadow-[0px_18px_40px_0px_rgba(0,0,0,0.08)]"
          />
        ) : (
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-text-2">
              드래그 앤 드롭 또는 버튼으로 썸네일을 선택하세요.
            </p>
            <p className="text-[11px] text-text-4">
              JPEG, PNG, GIF, WebP, SVG · 최대 10MB
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-9 rounded-[0.75rem] border border-border-3 px-3 text-[11px] font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
          >
            파일 선택
          </button>
          {pendingFile ? (
            <button
              type="button"
              onClick={() => void uploadFile(pendingFile)}
              disabled={isUploading}
              className="inline-flex h-9 items-center gap-2 rounded-[0.75rem] bg-primary-1 px-3 text-[11px] font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {isUploading ? <Spinner size="sm" /> : null}
              업로드
            </button>
          ) : null}
          {pendingFile || isAwaitingPaste ? (
            <button
              type="button"
              onClick={() => {
                setPendingFile(null);
                setIsAwaitingPaste(false);
              }}
              className="rounded-[0.8rem] border border-border-3 px-3 py-2 text-xs font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
            >
              취소
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void uploadFile(file);
          }
          event.target.value = "";
        }}
      />

      <AssetPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setPendingFile(null);
          setIsAwaitingPaste(false);
          setIsPickerOpen(false);
          toast.success("에셋 갤러리에서 썸네일을 선택했습니다.");
        }}
      />
    </div>
  );
}
