"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import galleryWideLinear from "@iconify-icons/solar/gallery-wide-linear";
import linkMinimalistic2Linear from "@iconify-icons/solar/link-minimalistic-2-linear";
import { cn } from "@shared/lib/style-utils";
import { Spinner } from "@shared/ui/libs";

export interface PendingUploadFile {
  id: string;
  file: File;
  previewUrl?: string;
}

interface UploadZoneProps {
  files: PendingUploadFile[];
  isUploading: boolean;
  uploadProgress: number | null;
  errorMessage: string | null;
  onFilesAdded: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onClear: () => void;
  onUpload: () => void;
}

export function UploadZone({
  files,
  isUploading,
  uploadProgress,
  errorMessage,
  onFilesAdded,
  onRemoveFile,
  onClear,
  onUpload,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasFiles = files.length > 0;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-border-3 px-6 py-10 text-center transition-colors">
        <DropArea
          disabled={isUploading}
          onFilesAdded={onFilesAdded}
          onPick={() => inputRef.current?.click()}
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        multiple
        disabled={isUploading}
        className="hidden"
        onChange={(event) => {
          if (!event.target.files) {
            return;
          }

          onFilesAdded(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="rounded-xl border border-border-4 bg-background-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-2">
              업로드 큐 ({files.length}개)
            </span>
            {isUploading && uploadProgress !== null ? (
              <span className="text-xs text-text-4">{uploadProgress}%</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border-3 px-3 text-[13px] font-normal text-text-2 transition-colors hover:bg-background-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              파일 선택
            </button>
            <button
              type="button"
              onClick={onUpload}
              disabled={!hasFiles || isUploading}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary-1 px-3 text-[13px] font-normal text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Spinner size="sm" /> 업로드 중
                </>
              ) : (
                "업로드"
              )}
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={!hasFiles || isUploading}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border-3 px-3 text-[13px] font-normal text-text-3 transition-colors hover:bg-background-1 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              비우기
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-sm text-negative-1">
            {errorMessage}
          </div>
        ) : null}

        {isUploading && uploadProgress !== null ? (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-background-3">
              <div
                className="h-full rounded-full bg-primary-1 transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-row flex-wrap gap-3">
          {hasFiles ? (
            files.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border-4 bg-background-1 px-3 py-2"
              >
                <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded bg-background-3">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-4">
                      file
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="max-w-[12rem] truncate text-sm font-medium text-text-1">
                    {item.file.name}
                  </span>
                  <span className="text-xs text-text-4">
                    {formatFileSize(item.file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(item.id)}
                  disabled={isUploading}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border-3 px-3 text-xs font-normal text-text-2 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  제거
                </button>
              </div>
            ))
          ) : (
            <div className="w-full rounded-lg border border-dashed border-border-3 px-4 py-6 text-center text-sm text-text-4">
              아직 선택된 파일이 없습니다.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DropArea({
  disabled,
  onFilesAdded,
  onPick,
}: {
  disabled: boolean;
  onFilesAdded: (files: FileList | File[]) => void;
  onPick: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="파일을 드래그하거나 클릭하여 대기열에 추가"
      className={cn(
        "rounded-[1.5rem] bg-transparent px-6 py-2 text-center transition-colors",
        !disabled && !isDragging && "hover:text-text-1",
        disabled && "cursor-not-allowed opacity-60",
        isDragging && !disabled && "text-primary-1",
      )}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onPick();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        if (disabled) return;
        dragCounterRef.current += 1;
        setIsDragging(true);
      }}
      onDragLeave={() => {
        if (disabled) return;
        dragCounterRef.current -= 1;
        if (dragCounterRef.current === 0) {
          setIsDragging(false);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragCounterRef.current = 0;
        setIsDragging(false);
        if (disabled || event.dataTransfer.files.length === 0) {
          return;
        }

        onFilesAdded(event.dataTransfer.files);
      }}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border-3 bg-background-1 text-primary-1">
        <Icon icon={galleryWideLinear} width="24" />
      </div>
      <p className="mt-4 text-body-xs uppercase tracking-[0.24em] text-text-4">
        Drag and drop
      </p>
      {isDragging ? (
        <h3 className="mt-3 text-lg font-semibold text-primary-1">
          놓으면 추가됩니다
        </h3>
      ) : (
        <h3 className="mt-3 text-lg font-semibold text-text-1">
          파일을 여기에 놓거나 선택해서 대기열에 추가하세요
        </h3>
      )}
      <p className="mt-2 text-sm text-text-3">
        업로드 버튼을 누르기 전까지 서버에는 전송되지 않습니다.
      </p>
      <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-border-3 px-5 py-2.5 text-sm font-medium text-text-2">
        <Icon icon={linkMinimalistic2Linear} width="15" />
        대기열에 파일 추가
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}
