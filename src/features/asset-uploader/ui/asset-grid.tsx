"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import checkCircleLinear from "@iconify-icons/solar/check-circle-linear";
import galleryWideLinear from "@iconify-icons/solar/gallery-wide-linear";
import linkMinimalistic2Linear from "@iconify-icons/solar/link-minimalistic-2-linear";
import trashBinMinimalisticLinear from "@iconify-icons/solar/trash-bin-minimalistic-linear";
import { useLongPress } from "../lib/use-long-press";
import type { Asset } from "@entities/asset";
import {
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
  onExitSelectionMode: () => void;
  onToggleSelect: (
    id: number,
    index: number,
    options?: { shiftKey: boolean },
  ) => void;
  onSelectAll: (checked: boolean) => void;
  onCopyUrl: (asset: Asset) => void;
  onOpenDetail: (assetId: number) => void;
  onRequestDelete: (ids: number[]) => void;
}

export function AssetGrid({
  assets,
  selectionMode,
  selectedIds,
  deletingIds,
  copiedAssetId,
  isPending,
  onEnterSelectionMode,
  onExitSelectionMode,
  onToggleSelect,
  onSelectAll,
  onCopyUrl,
  onOpenDetail,
  onRequestDelete,
}: AssetGridProps) {
  const allSelected =
    assets.length > 0 &&
    assets.every((asset) => selectedIds.includes(asset.id));

  return (
    <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
      <div className="border-b border-border-3 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
              Library
            </p>
            <h2 className="mt-3 text-xl font-semibold text-text-1">
              에셋 갤러리
            </h2>
            <p className="mt-2 text-sm text-text-3">
              이미지를 클릭하면 상세 보기를 열고, 길게 누르거나 선택 버튼으로
              여러 항목을 골라 삭제할 수 있습니다.
            </p>
          </div>

          {!selectionMode ? (
            <button
              type="button"
              onClick={onEnterSelectionMode}
              disabled={assets.length === 0 || isPending}
              className="inline-flex items-center justify-center rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              선택
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.15rem] border border-border-3 bg-background-1 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
              Assets
            </p>
            <p className="mt-1 text-lg font-semibold text-text-1">
              {assets.length}
            </p>
          </div>
          <div className="rounded-[1.15rem] border border-border-3 bg-background-1 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
              Selection
            </p>
            <p className="mt-1 text-sm text-text-2">
              {selectionMode
                ? `${selectedIds.length}개 선택 중`
                : "선택 모드 꺼짐"}
            </p>
          </div>
          <div className="rounded-[1.15rem] border border-border-3 bg-background-1 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
              Actions
            </p>
            <p className="mt-1 text-sm text-text-2">
              상세 보기, URL 복사, 삭제
            </p>
          </div>
        </div>

        {selectionMode ? (
          <div className="sticky top-16 z-10 mt-5 flex flex-col gap-3 rounded-[1.2rem] border border-primary-1/20 bg-background-1 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-text-2">
              선택됨{" "}
              <span className="font-semibold text-text-1">
                {selectedIds.length}
              </span>
              개
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectAll(!allSelected)}
                disabled={assets.length === 0 || isPending}
                className="inline-flex items-center justify-center rounded-[0.85rem] border border-border-3 px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {allSelected ? "전체 해제" : "전체 선택"}
              </button>
              <button
                type="button"
                onClick={() => onRequestDelete(selectedIds)}
                disabled={selectedIds.length === 0 || isPending}
                className="inline-flex items-center justify-center rounded-[0.85rem] border border-negative-1/20 px-4 py-2.5 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                삭제
              </button>
              <button
                type="button"
                onClick={onExitSelectionMode}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-[0.85rem] bg-primary-1 px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              >
                완료
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {assets.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              onRequestDelete={onRequestDelete}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.25rem] border border-dashed border-border-3 px-6 py-12 text-center">
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
  onRequestDelete,
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
  onRequestDelete: (ids: number[]) => void;
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
        "group relative overflow-hidden rounded-[1.4rem] border bg-background-1 transition-all",
        isSelected
          ? "border-primary-1 shadow-[0_0_0_3px_rgba(138,111,224,0.12)]"
          : "border-border-3 hover:-translate-y-0.5 hover:border-border-2",
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
            <span
              className={cn(
                "inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-semibold shadow-sm backdrop-blur",
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
          <div className="absolute right-3 top-3 z-10 hidden sm:block">
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onCopyUrl(asset);
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border-3 bg-background-1/90 px-3 text-xs font-medium text-text-2 opacity-0 shadow-sm backdrop-blur transition-all group-hover:opacity-100 group-focus-within:opacity-100 hover:border-border-2 hover:text-text-1"
            >
              <Icon icon={linkMinimalistic2Linear} width="14" />
              {isCopied ? "복사됨" : "URL 복사"}
            </button>
          </div>
        ) : null}

        <div className="space-y-3 p-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="truncate text-sm font-semibold text-text-1">
                {getAssetFilename(asset.url)}
              </p>
              <span className="shrink-0 rounded-full bg-background-3 px-2 py-1 text-[11px] font-medium text-text-3">
                #{asset.id}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-4">
              {formatAssetFileSize(asset.sizeBytes)} ·{" "}
              {formatAssetResolution(asset.width, asset.height)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-text-4">
            <span className="truncate">{asset.mimeType}</span>
            <span
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-medium",
                isDeleting
                  ? "bg-negative-1/10 text-negative-1"
                  : "bg-background-3 text-text-3",
              )}
            >
              {isDeleting ? "삭제 중..." : "상세 보기"}
            </span>
          </div>
        </div>
      </div>

      {selectionMode ? null : (
        <div className="border-t border-border-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenDetail(asset.id)}
              className="inline-flex items-center justify-center gap-1.5 rounded-[0.8rem] border border-border-3 px-3 py-2 text-xs font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
            >
              <Icon icon={galleryWideLinear} width="14" />
              상세
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete([asset.id])}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-[0.8rem] border border-negative-1/20 px-3 py-2 text-xs font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon icon={trashBinMinimalisticLinear} width="14" />
              삭제
            </button>
          </div>
        </div>
      )}
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
