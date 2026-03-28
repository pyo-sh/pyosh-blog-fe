"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAssets, type Asset } from "@entities/asset";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { Modal } from "@shared/ui/libs";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: Asset) => void;
  onSelectLocalFiles: (files: FileList | File[]) => void;
}

export function ImageGalleryModal({
  isOpen,
  onClose,
  onSelectAsset,
  onSelectLocalFiles,
}: ImageGalleryModalProps) {
  const assetsQuery = useQuery({
    queryKey: ["post-editor-assets"],
    queryFn: () => fetchAssets(1, 12),
    enabled: isOpen,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} withBackground>
      <div className="flex h-[min(88vh,52rem)] w-[min(92vw,64rem)] flex-col overflow-hidden rounded-[1.5rem] bg-background-1 text-left">
        <div className="border-b border-border-3 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.24em] text-text-4">
            Images
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-text-1">이미지 삽입</h2>
              <p className="mt-1 text-sm text-text-3">
                로컬 이미지를 추가하거나 기존 에셋을 본문에 삽입합니다.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-[0.9rem] bg-primary-1 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              기기에서 선택
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                multiple
                className="sr-only"
                onChange={(event) => {
                  if (!event.target.files || event.target.files.length === 0) {
                    return;
                  }

                  onSelectLocalFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {assetsQuery.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-[1.25rem] bg-background-2"
                />
              ))}
            </div>
          ) : null}

          {assetsQuery.isError ? (
            <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/5 px-4 py-3 text-sm text-negative-1">
              {getErrorMessage(
                assetsQuery.error,
                "에셋 목록을 불러오지 못했습니다.",
              )}
            </div>
          ) : null}

          {!assetsQuery.isPending &&
          !assetsQuery.isError &&
          (assetsQuery.data?.data.length ?? 0) === 0 ? (
            <div className="rounded-[1rem] border border-border-3 bg-background-2 px-4 py-6 text-sm text-text-3">
              표시할 에셋이 없습니다. 위 버튼으로 이미지를 선택해 주세요.
            </div>
          ) : null}

          {!assetsQuery.isPending &&
          !assetsQuery.isError &&
          (assetsQuery.data?.data.length ?? 0) > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assetsQuery.data?.data.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onSelectAsset(asset)}
                  className="overflow-hidden rounded-[1.25rem] border border-border-3 bg-background-2 text-left transition-colors hover:border-primary-1"
                >
                  <div className="aspect-[4/3] bg-background-3">
                    <img
                      src={asset.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 px-4 py-3">
                    <p className="truncate text-sm font-medium text-text-1">
                      {getAssetLabel(asset)}
                    </p>
                    <p className="text-xs text-text-4">{asset.mimeType}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function getAssetLabel(asset: Asset): string {
  const segment = asset.url.split("/").pop()?.trim();

  return segment || `asset-${asset.id}`;
}
