"use client";

import { useEffect, useMemo, useState } from "react";
import type { Asset } from "@entities/asset";
import {
  buildAssetMarkdown,
  formatAssetDate,
  formatAssetFileSize,
  formatAssetResolution,
  getAssetFilename,
} from "@entities/asset";
import { cn } from "@shared/lib/style-utils";
import { Modal } from "@shared/ui/libs";

interface AssetDetailModalProps {
  assets: Asset[];
  assetId: number | null;
  copiedType: "url" | "markdown" | null;
  onClose: () => void;
  onCopy: (asset: Asset, type: "url" | "markdown") => void;
  onRequestDelete: (asset: Asset) => void;
  onSelectAsset: (assetId: number) => void;
}

export function AssetDetailModal({
  assets,
  assetId,
  copiedType,
  onClose,
  onCopy,
  onRequestDelete,
  onSelectAsset,
}: AssetDetailModalProps) {
  const currentIndex = useMemo(
    () => assets.findIndex((asset) => asset.id === assetId),
    [assetId, assets],
  );
  const asset = currentIndex >= 0 ? assets[currentIndex] : null;
  const prevAsset = currentIndex > 0 ? assets[currentIndex - 1] : null;
  const nextAsset =
    currentIndex >= 0 && currentIndex < assets.length - 1
      ? assets[currentIndex + 1]
      : null;

  useEffect(() => {
    if (!asset) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && prevAsset) {
        event.preventDefault();
        onSelectAsset(prevAsset.id);
      }

      if (event.key === "ArrowRight" && nextAsset) {
        event.preventDefault();
        onSelectAsset(nextAsset.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [asset, nextAsset, onSelectAsset, prevAsset]);

  if (!asset) {
    return null;
  }

  return (
    <Modal
      isOpen={Boolean(asset)}
      onClose={onClose}
      withBackground
      className="w-[min(94vw,72rem)] p-0 text-left"
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-[1.5rem] bg-background-1">
        <div className="flex items-start justify-between gap-4 border-b border-border-3 px-6 py-5">
          <div>
            <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
              Asset detail
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-1">
              에셋 상세
            </h2>
            <p className="mt-1 text-sm text-text-3">
              원본 미리보기와 메타데이터를 확인하고 복사 또는 삭제할 수
              있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-3 text-text-3 transition-colors hover:border-border-2 hover:text-text-1"
            aria-label="에셋 상세 닫기"
          >
            ×
          </button>
        </div>

        <div className="grid min-h-0 gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.85fr)]">
          <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden border-b border-border-3 bg-background-2 px-6 py-6 lg:border-b-0 lg:border-r">
            <button
              type="button"
              onClick={() => prevAsset && onSelectAsset(prevAsset.id)}
              disabled={!prevAsset}
              className={cn(
                "absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-3 bg-background-1/90 text-lg text-text-2 backdrop-blur transition-colors",
                prevAsset
                  ? "hover:border-border-2 hover:text-text-1"
                  : "cursor-not-allowed opacity-40",
              )}
              aria-label="이전 에셋"
            >
              ←
            </button>

            <a
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="group relative block w-full max-w-[48rem]"
            >
              <AssetPreview asset={asset} />
              <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-background-1/85 px-3 py-1 text-xs font-medium text-text-2 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
                원본 열기
              </span>
            </a>

            <button
              type="button"
              onClick={() => nextAsset && onSelectAsset(nextAsset.id)}
              disabled={!nextAsset}
              className={cn(
                "absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-3 bg-background-1/90 text-lg text-text-2 backdrop-blur transition-colors",
                nextAsset
                  ? "hover:border-border-2 hover:text-text-1"
                  : "cursor-not-allowed opacity-40",
              )}
              aria-label="다음 에셋"
            >
              →
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto px-6 py-6">
            <dl className="space-y-4 text-sm">
              <InfoRow label="파일명" value={getAssetFilename(asset.url)} />
              <InfoRow
                label="크기"
                value={formatAssetFileSize(asset.sizeBytes)}
              />
              <InfoRow
                label="해상도"
                value={formatAssetResolution(asset.width, asset.height)}
              />
              <InfoRow label="형식" value={asset.mimeType} />
              <InfoRow
                label="업로드"
                value={formatAssetDate(asset.createdAt)}
              />
              <div className="rounded-[1rem] border border-border-3 bg-background-2 p-4">
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
                  URL
                </dt>
                <dd className="mt-3 break-all text-sm text-text-2">
                  {asset.url}
                </dd>
              </div>
              <div className="rounded-[1rem] border border-border-3 bg-background-2 p-4">
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
                  마크다운
                </dt>
                <dd className="mt-3 break-all text-sm text-text-2">
                  {buildAssetMarkdown(asset)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onCopy(asset, "url")}
                className="inline-flex items-center justify-center rounded-[0.9rem] border border-border-3 px-4 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
              >
                {copiedType === "url" ? "URL 복사됨" : "URL 복사"}
              </button>
              <button
                type="button"
                onClick={() => onCopy(asset, "markdown")}
                className="inline-flex items-center justify-center rounded-[0.9rem] border border-border-3 px-4 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
              >
                {copiedType === "markdown"
                  ? "마크다운 복사됨"
                  : "마크다운 복사"}
              </button>
              <button
                type="button"
                onClick={() => onRequestDelete(asset)}
                className="ml-auto inline-flex items-center justify-center rounded-[0.9rem] bg-negative-1 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-border-3 bg-background-2 p-4">
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-text-4">
        {label}
      </dt>
      <dd className="mt-3 text-sm text-text-2">{value}</dd>
    </div>
  );
}

function AssetPreview({ asset }: { asset: Asset }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex min-h-[18rem] items-center justify-center rounded-[1.35rem] border border-dashed border-border-3 bg-background-1 px-6 py-10 text-sm text-text-4">
        이미지를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin asset hosts are allowed
    <img
      src={asset.url}
      alt={getAssetFilename(asset.url)}
      className="max-h-[70vh] w-full rounded-[1.35rem] object-contain shadow-[0px_18px_50px_0px_rgba(0,0,0,0.14)]"
      onError={() => setHasError(true)}
    />
  );
}
