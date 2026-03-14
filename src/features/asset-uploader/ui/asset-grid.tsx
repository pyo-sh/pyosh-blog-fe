"use client";

import Image from "next/image";
import type { Asset } from "@entities/asset";
import { cn } from "@shared/lib/style-utils";

interface AssetGridProps {
  assets: Asset[];
  selectedIds: number[];
  deletingIds: number[];
  copiedState: { id: number; type: "url" | "markdown" } | null;
  isPending: boolean;
  onToggleSelect: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  onCopy: (asset: Asset, type: "url" | "markdown") => void;
  onRequestDelete: (ids: number[]) => void;
}

export function AssetGrid({
  assets,
  selectedIds,
  deletingIds,
  copiedState,
  isPending,
  onToggleSelect,
  onSelectAll,
  onCopy,
  onRequestDelete,
}: AssetGridProps) {
  const allSelected =
    assets.length > 0 &&
    assets.every((asset) => selectedIds.includes(asset.id));

  return (
    <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
      <div className="flex flex-col gap-4 border-b border-border-3 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Library
          </p>
          <h2 className="mt-3 text-xl font-semibold text-text-1">
            에셋 갤러리
          </h2>
          <p className="mt-2 text-sm text-text-3">
            hover 시 복사와 삭제 액션을 사용할 수 있고, 체크박스로 여러 항목을
            선택해 일괄 삭제할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-3 rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => onSelectAll(event.target.checked)}
              disabled={assets.length === 0 || isPending}
              className="h-4 w-4 rounded border-border-3"
            />
            현재 페이지 전체 선택
          </label>
          <button
            type="button"
            onClick={() => onRequestDelete(selectedIds)}
            disabled={selectedIds.length === 0 || isPending}
            className="inline-flex items-center justify-center rounded-[0.9rem] border border-negative-1/20 px-4 py-3 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            선택 {selectedIds.length}개 삭제
          </button>
        </div>
      </div>

      {assets.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => {
            const isSelected = selectedIds.includes(asset.id);
            const isDeleting = deletingIds.includes(asset.id);
            const filename = getFilename(asset.url);

            return (
              <article
                key={asset.id}
                className={cn(
                  "group relative overflow-hidden rounded-[1.4rem] border border-border-3 bg-background-1 transition-transform",
                  isSelected &&
                    "border-primary-1/60 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]",
                )}
              >
                <div className="absolute left-3 top-3 z-10">
                  <label className="inline-flex items-center rounded-full bg-background-2/90 px-2 py-1 text-xs text-text-2 shadow-sm backdrop-blur">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(asset.id)}
                      disabled={isPending}
                      className="mr-2 h-4 w-4 rounded border-border-3"
                    />
                    선택
                  </label>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden bg-background-3">
                  <Image
                    src={asset.url}
                    alt={filename}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" />
                  <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => onCopy(asset, "url")}
                      disabled={isPending}
                      className="flex-1 rounded-[0.9rem] bg-background-2/90 px-3 py-2 text-xs font-medium text-text-1 backdrop-blur transition-colors hover:bg-background-2"
                    >
                      {copiedState?.id === asset.id &&
                      copiedState.type === "url"
                        ? "URL 복사됨"
                        : "URL 복사"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCopy(asset, "markdown")}
                      disabled={isPending}
                      className="flex-1 rounded-[0.9rem] bg-background-2/90 px-3 py-2 text-xs font-medium text-text-1 backdrop-blur transition-colors hover:bg-background-2"
                    >
                      {copiedState?.id === asset.id &&
                      copiedState.type === "markdown"
                        ? "마크다운 복사됨"
                        : "마크다운 복사"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDelete([asset.id])}
                      disabled={isPending}
                      className="rounded-[0.9rem] bg-negative-1/90 px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="truncate text-sm font-semibold text-text-1">
                      {filename}
                    </p>
                    <p className="mt-1 text-xs text-text-4">
                      {formatFileSize(asset.sizeBytes)} ·{" "}
                      {formatResolution(asset.width, asset.height)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs text-text-4">
                    <span>
                      {new Date(asset.createdAt).toLocaleString("ko-KR")}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1",
                        isDeleting
                          ? "bg-negative-1/10 text-negative-1"
                          : "bg-background-3 text-text-3",
                      )}
                    >
                      {isDeleting ? "삭제 중..." : asset.mimeType}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.25rem] border border-dashed border-border-3 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-text-1">
            아직 등록된 에셋이 없습니다.
          </p>
          <p className="mt-2 text-sm text-text-4">
            위 업로드 영역에서 파일을 추가한 뒤 업로드 버튼을 눌러 첫 에셋을
            만들어 보세요.
          </p>
        </div>
      )}
    </section>
  );
}

function getFilename(url: string): string {
  const pathname = url.split("?")[0] ?? url;
  const parts = pathname.split("/");
  const segment = parts[parts.length - 1] || "asset";

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
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

function formatResolution(width?: number, height?: number): string {
  if (!width || !height) {
    return "해상도 정보 없음";
  }

  return `${width}×${height}`;
}
