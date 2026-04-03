"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import closeCircleLinear from "@iconify-icons/solar/close-circle-linear";
import codeSquareLinear from "@iconify-icons/solar/code-square-linear";
import linkMinimalistic2Linear from "@iconify-icons/solar/link-minimalistic-2-linear";
import trashBinMinimalisticLinear from "@iconify-icons/solar/trash-bin-minimalistic-linear";
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
      aria-label="에셋 상세 보기"
      className="w-[min(94vw,42rem)] p-0 text-left"
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-[1.5rem] bg-background-1">
        <div className="flex items-center justify-between gap-4 border-b border-border-3 px-6 py-4">
          <h3 className="truncate text-lg font-bold text-text-1">
            {getAssetFilename(asset.url)}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-2 hover:text-text-1"
            aria-label="에셋 상세 닫기"
          >
            <Icon icon={closeCircleLinear} width="22" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="relative mb-4 overflow-hidden rounded-lg bg-background-3">
            <button
              type="button"
              onClick={() => prevAsset && onSelectAsset(prevAsset.id)}
              disabled={!prevAsset}
              className={cn(
                "absolute left-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background-1/90 text-text-2 backdrop-blur transition-colors",
                prevAsset
                  ? "cursor-pointer hover:bg-background-1 hover:text-text-1"
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
              className="block"
            >
              <AssetPreview asset={asset} />
            </a>

            <button
              type="button"
              onClick={() => nextAsset && onSelectAsset(nextAsset.id)}
              disabled={!nextAsset}
              className={cn(
                "absolute right-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background-1/90 text-text-2 backdrop-blur transition-colors",
                nextAsset
                  ? "cursor-pointer hover:bg-background-1 hover:text-text-1"
                  : "cursor-not-allowed opacity-40",
              )}
              aria-label="다음 에셋"
            >
              →
            </button>
          </div>

          <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3">
            <InfoRow label="파일명" value={getAssetFilename(asset.url)} />
            <InfoRow label="형식" value={asset.mimeType} />
            <InfoRow
              label="크기"
              value={formatAssetFileSize(asset.sizeBytes)}
            />
            <InfoRow
              label="해상도"
              value={formatAssetResolution(asset.width, asset.height)}
            />
            <InfoRow
              label="업로드 일시"
              value={formatAssetDate(asset.createdAt)}
            />
          </dl>

          <div className="space-y-4">
            <CodeInfoBlock
              label="URL"
              value={asset.url}
              copied={copiedType === "url"}
              icon={<Icon icon={linkMinimalistic2Linear} width="14" />}
              onCopy={() => onCopy(asset, "url")}
            />
            <CodeInfoBlock
              label="마크다운"
              value={buildAssetMarkdown(asset)}
              copied={copiedType === "markdown"}
              icon={<Icon icon={codeSquareLinear} width="14" />}
              onCopy={() => onCopy(asset, "markdown")}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => onRequestDelete(asset)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-negative-1 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Icon icon={trashBinMinimalisticLinear} width="16" />
              삭제
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CodeInfoBlock({
  label,
  value,
  copied,
  icon,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  icon: ReactNode;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[12px] font-normal leading-none text-text-3">
          {label}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-3 px-3 py-1.5 text-[13px] font-normal leading-none text-text-2 transition-colors hover:bg-background-2 hover:text-text-1"
        >
          {icon}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-background-2 px-4 py-3 text-[13px] font-normal leading-5 text-text-1">
        <code>{value}</code>
      </pre>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1.5 text-[12px] font-normal leading-none text-text-3">
        {label}
      </dt>
      <dd className="pl-2 text-[14px] font-normal leading-[1.25rem] text-text-1">
        {value}
      </dd>
    </div>
  );
}

function AssetPreview({ asset }: { asset: Asset }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [asset.url]);

  if (hasError) {
    return (
      <div className="flex min-h-[18rem] items-center justify-center px-6 py-10 text-sm text-text-4">
        이미지를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin asset hosts are allowed
    <img
      src={asset.url}
      alt={getAssetFilename(asset.url)}
      className="w-full object-contain"
      style={{ maxHeight: "60vh" }}
      onError={() => setHasError(true)}
    />
  );
}
