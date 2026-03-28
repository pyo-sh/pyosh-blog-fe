"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAssets } from "../api";
import {
  formatAssetFileSize,
  formatAssetResolution,
  getAssetFilename,
} from "../lib";
import type { Asset } from "../model";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";
import { Modal } from "@shared/ui/libs";

const PAGE_SIZE = 18;

interface AssetPickerModalProps {
  isOpen: boolean;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function AssetPickerModal({
  isOpen,
  onSelect,
  onClose,
}: AssetPickerModalProps) {
  const [page, setPage] = useState(1);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  const assetsQuery = useQuery({
    queryKey: ["asset-picker-assets", page],
    queryFn: () => fetchAssets(page, PAGE_SIZE),
    enabled: isOpen,
  });

  const assets = assetsQuery.data?.data ?? [];
  const meta = assetsQuery.data?.meta;
  const selectedAsset =
    assets.find((asset) => asset.id === selectedAssetId) ?? null;

  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setSelectedAssetId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedAssetId((current) =>
      current && assets.some((asset) => asset.id === current) ? current : null,
    );
  }, [assets]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      withBackground
      className="w-[min(94vw,72rem)] p-0 text-left"
    >
      <div className="flex h-[min(88vh,56rem)] flex-col overflow-hidden rounded-[1.5rem] bg-background-1">
        <div className="flex items-start justify-between gap-4 border-b border-border-3 px-6 py-5">
          <div>
            <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
              Asset picker
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-1">
              에셋 선택
            </h2>
            <p className="mt-1 text-sm text-text-3">
              썸네일로 사용할 이미지를 선택하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-3 text-text-3 transition-colors hover:border-border-2 hover:text-text-1"
            aria-label="에셋 선택 닫기"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {assetsQuery.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] animate-pulse rounded-[1.25rem] bg-background-2"
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
          assets.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-border-3 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-text-1">
                에셋이 없습니다.
              </p>
              <p className="mt-2 text-sm text-text-4">
                먼저 에셋 관리 페이지에서 이미지를 업로드해 주세요.
              </p>
            </div>
          ) : null}

          {!assetsQuery.isPending &&
          !assetsQuery.isError &&
          assets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <AssetPickerCard
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAssetId === asset.id}
                  onSelect={() => setSelectedAssetId(asset.id)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-border-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-text-4">
            {meta
              ? meta.total === 0
                ? "표시할 에셋이 없습니다."
                : `총 ${meta.total}개 중 ${(meta.page - 1) * meta.limit + 1}-${(meta.page - 1) * meta.limit + assets.length}`
              : "페이지 정보를 불러오는 중입니다."}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!meta || meta.page <= 1}
              className="inline-flex items-center justify-center rounded-[0.85rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-sm text-text-3">
              {meta ? `${meta.page}/${Math.max(meta.totalPages, 1)}` : "-/-"}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  meta ? Math.min(meta.totalPages, current + 1) : current,
                )
              }
              disabled={!meta || meta.page >= meta.totalPages}
              className="inline-flex items-center justify-center rounded-[0.85rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-[0.85rem] border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => selectedAsset && onSelect(selectedAsset.url)}
              disabled={!selectedAsset}
              className="inline-flex items-center justify-center rounded-[0.85rem] bg-primary-1 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              선택
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AssetPickerCard({
  asset,
  isSelected,
  onSelect,
}: {
  asset: Asset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "overflow-hidden rounded-[1.25rem] border bg-background-2 text-left transition-all",
        isSelected
          ? "border-primary-1 shadow-[0_0_0_3px_rgba(138,111,224,0.12)]"
          : "border-border-3 hover:border-border-2",
      )}
      aria-pressed={isSelected}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background-3">
        {hasError ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-text-4">
            미리보기 실패
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin asset hosts are allowed
          <img
            src={asset.url}
            alt={getAssetFilename(asset.url)}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        )}
        <div className="absolute left-3 top-3">
          <span
            className={cn(
              "inline-flex min-h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-semibold backdrop-blur",
              isSelected
                ? "border-primary-1 bg-primary-1 text-white"
                : "border-border-3 bg-background-1/85 text-text-3",
            )}
          >
            {isSelected ? "선택" : ""}
          </span>
        </div>
      </div>
      <div className="space-y-1 px-4 py-3">
        <p className="truncate text-sm font-medium text-text-1">
          {getAssetFilename(asset.url)}
        </p>
        <p className="text-xs text-text-4">
          {formatAssetFileSize(asset.sizeBytes)} ·{" "}
          {formatAssetResolution(asset.width, asset.height)}
        </p>
      </div>
    </button>
  );
}
