"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import checkCircleLinear from "@iconify-icons/solar/check-circle-linear";
import checkSquareLinear from "@iconify-icons/solar/check-square-linear";
import linkMinimalistic2Linear from "@iconify-icons/solar/link-minimalistic-2-linear";
import { useLongPress } from "../lib/use-long-press";
import type { Asset } from "@entities/asset";
import {
  formatAssetDate,
  formatAssetFileSize,
  formatAssetResolution,
  getAssetFilename,
} from "@entities/asset";
import { cn } from "@shared/lib/style-utils";

interface AssetGridProps {
  assets: Asset[];
  selectionMode: boolean;
  selectedIds: number[];
  deletingIds: number[];
  copiedAssetId: number | null;
  isPending: boolean;
  onEnterSelectionMode: () => void;
  onToggleSelect: (
    id: number,
    index: number,
    options?: { shiftKey: boolean },
  ) => void;
  onCopyUrl: (asset: Asset) => void;
  onOpenDetail: (assetId: number) => void;
}

export function AssetGrid({
  assets,
  selectionMode,
  selectedIds,
  deletingIds,
  copiedAssetId,
  isPending,
  onEnterSelectionMode,
  onToggleSelect,
  onCopyUrl,
  onOpenDetail,
}: AssetGridProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] leading-none text-text-3">
          총 {assets.length}개
        </p>
        {!selectionMode ? (
          <button
            type="button"
            onClick={onEnterSelectionMode}
            disabled={assets.length === 0 || isPending}
            className="inline-flex h-8 w-[5.5rem] items-center justify-center gap-1.5 rounded-lg border border-border-3 px-3 text-[13px] font-normal leading-none text-text-2 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon icon={checkSquareLinear} width="16" />
            선택
          </button>
        ) : null}
      </div>

      {assets.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset, index) => (
            <AssetGridCard
              key={asset.id}
              asset={asset}
              index={index}
              selectionMode={selectionMode}
              isSelected={selectedIds.includes(asset.id)}
              isDeleting={deletingIds.includes(asset.id)}
              isCopied={copiedAssetId === asset.id}
              isPending={isPending}
              onEnterSelectionMode={onEnterSelectionMode}
              onToggleSelect={onToggleSelect}
              onCopyUrl={onCopyUrl}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.25rem] border border-dashed border-border-3 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-text-1">에셋이 없습니다.</p>
          <p className="mt-2 text-sm text-text-4">
            먼저 이미지를 업로드한 뒤 갤러리에서 상세 보기와 선택 모드를 사용할
            수 있습니다.
          </p>
        </div>
      )}
    </section>
  );
}

function AssetGridCard({
  asset,
  index,
  selectionMode,
  isSelected,
  isDeleting,
  isCopied,
  isPending,
  onEnterSelectionMode,
  onToggleSelect,
  onCopyUrl,
  onOpenDetail,
}: {
  asset: Asset;
  index: number;
  selectionMode: boolean;
  isSelected: boolean;
  isDeleting: boolean;
  isCopied: boolean;
  isPending: boolean;
  onEnterSelectionMode: () => void;
  onToggleSelect: (
    id: number,
    index: number,
    options?: { shiftKey: boolean },
  ) => void;
  onCopyUrl: (asset: Asset) => void;
  onOpenDetail: (assetId: number) => void;
}) {
  const longPress = useLongPress({
    onLongPress: () => {
      if (selectionMode || isPending) {
        return;
      }

      onEnterSelectionMode();
      onToggleSelect(asset.id, index, { shiftKey: false });
    },
    onClick: () => {
      if (isPending) {
        return;
      }

      if (selectionMode) {
        onToggleSelect(asset.id, index, { shiftKey: false });

        return;
      }

      onOpenDetail(asset.id);
    },
  });

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border-4 bg-background-2 transition-all",
        isSelected
          ? "border-primary-1 shadow-[0_0_0_3px_rgba(138,111,224,0.12)]"
          : "hover:border-border-3",
        longPress.isPressing && "border-primary-1 bg-primary-1/5",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        {...longPress.bind}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (selectionMode) {
              onToggleSelect(asset.id, index, { shiftKey: event.shiftKey });
            } else {
              onOpenDetail(asset.id);
            }
          }
        }}
        className="block w-full text-left"
        aria-pressed={selectionMode ? isSelected : undefined}
      >
        <AssetCardMedia asset={asset} />

        {selectionMode ? (
          <div className="absolute left-3 top-3 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              aria-hidden="true"
              className="h-4 w-4 cursor-pointer rounded border-border-3 accent-primary-1"
            />
            <span
              className={cn(
                "sr-only inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-semibold shadow-sm backdrop-blur",
                isSelected
                  ? "border-primary-1 bg-primary-1 text-white"
                  : "border-border-3 bg-background-1/90 text-text-3",
              )}
            >
              {isSelected ? <Icon icon={checkCircleLinear} width="16" /> : ""}
            </span>
          </div>
        ) : null}

        {!selectionMode ? (
          <div className="absolute right-3 top-3 z-10">
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onCopyUrl(asset);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 p-0 text-white opacity-0 transition-all group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-black/50"
              title={isCopied ? "복사됨" : "URL 복사"}
            >
              <Icon icon={linkMinimalistic2Linear} width="14" />
            </button>
          </div>
        ) : null}

        <div className="p-3">
          <div className="space-y-1">
            <p className="truncate text-[13px] font-medium leading-none text-text-1">
              {getAssetFilename(asset.url)}
            </p>
            <p className="truncate text-[12px] leading-none text-text-4">
              {formatAssetFileSize(asset.sizeBytes)} /{" "}
              {formatAssetResolution(asset.width, asset.height)} /{" "}
              {formatAssetDate(asset.createdAt)}
            </p>
            {isCopied ? (
              <p className="text-[11px] leading-none text-primary-1">
                URL 복사됨
              </p>
            ) : null}
            {isDeleting ? (
              <p className="text-[11px] leading-none text-negative-1">
                삭제 중...
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function AssetCardMedia({ asset }: { asset: Asset }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-background-3">
      {hasError ? (
        <div className="flex h-full items-center justify-center px-6 text-sm text-text-4">
          미리보기를 불러오지 못했습니다.
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin asset hosts are allowed
        <img
          src={asset.url}
          alt={getAssetFilename(asset.url)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
