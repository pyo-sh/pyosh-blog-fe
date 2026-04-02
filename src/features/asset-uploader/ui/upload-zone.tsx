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
    <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
      <div className="flex flex-col gap-4 border-b border-border-3 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Upload Queue
          </p>
          <h2 className="mt-3 text-xl font-semibold text-text-1">
            업로드 대기열
          </h2>
          <p className="mt-2 text-sm text-text-3">
            JPEG, PNG, GIF, WebP, SVG 파일을 최대 5개, 개당 10MB까지 올릴 수
            있습니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            파일 선택
          </button>
          <button
            type="button"
            onClick={onUpload}
            disabled={!hasFiles || isUploading}
            className="inline-flex items-center justify-center rounded-[0.9rem] bg-primary-1 px-4 py-3 text-sm font-medium text-text-1 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Spinner size="sm" /> 업로드 중
              </>
            ) : (
              `${files.length}개 업로드`
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.15rem] border border-border-3 bg-background-1 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
            Queue
          </p>
          <p className="mt-1 text-lg font-semibold text-text-1">
            {files.length}/5
          </p>
        </div>
        <div className="rounded-[1.15rem] border border-border-3 bg-background-1 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
            Types
          </p>
          <p className="mt-1 text-sm text-text-2">JPG PNG GIF WebP SVG</p>
        </div>
        <div className="rounded-[1.15rem] border border-border-3 bg-background-1 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
            Limit
          </p>
          <p className="mt-1 text-sm text-text-2">파일당 10MB</p>
        </div>
      </div>

      <DropArea
        disabled={isUploading}
        onFilesAdded={onFilesAdded}
        onPick={() => inputRef.current?.click()}
      />

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

      {errorMessage ? (
        <div className="mt-5 rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-sm text-negative-1">
          {errorMessage}
        </div>
      ) : null}

      {isUploading && uploadProgress !== null ? (
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-text-4">
            <span>업로드 중...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background-3">
            <div
              className="h-full rounded-full bg-primary-1 transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-[1.25rem] border border-border-3 bg-background-1 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-text-1">선택된 파일</h3>
            <p className="mt-1 text-xs text-text-4">
              업로드 전에 목록을 확인하고 필요 없는 항목은 제거할 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClear}
            disabled={!hasFiles || isUploading}
            className="text-xs font-medium text-text-4 transition-colors hover:text-text-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            전체 비우기
          </button>
        </div>

        {hasFiles ? (
          <ul className="mt-4 space-y-3">
            {files.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-[1rem] border border-border-3 bg-background-2 px-4 py-3"
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[0.85rem] border border-border-3 bg-background-3">
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-1">
                    {item.file.name}
                  </p>
                  <p className="mt-1 text-xs text-text-4">
                    {formatFileSize(item.file.size)} ·{" "}
                    {item.file.type || "알 수 없는 형식"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(item.id)}
                  disabled={isUploading}
                  className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-2 text-xs font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-[1rem] border border-dashed border-border-3 px-4 py-8 text-center text-sm text-text-4">
            아직 선택된 파일이 없습니다.
          </div>
        )}
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
        "mt-6 rounded-[1.5rem] border border-dashed border-border-3 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_55%)] px-6 py-10 text-center transition-colors",
        !disabled &&
          !isDragging &&
          "hover:border-primary-1/60 hover:bg-background-1",
        disabled && "cursor-not-allowed opacity-60",
        isDragging && !disabled && "border-primary-1 bg-primary-2/10",
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
      <button
        type="button"
        onClick={onPick}
        disabled={disabled}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-border-3 px-5 py-2.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed"
      >
        <Icon icon={linkMinimalistic2Linear} width="15" />
        대기열에 파일 추가
      </button>
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
