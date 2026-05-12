"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAssetCategories, fetchAssets } from "../api";
import {
  formatAssetFileSize,
  formatAssetResolution,
  getAssetCategoryTone,
  getAssetDisplayName,
  getAssetFilename,
} from "../lib";
import { adminAssetKeys } from "../query-keys";
import type { Asset, AssetCategory } from "../model";
import { normalizeAssetUrl, toCanonicalAssetUrl } from "@shared/lib/asset-url";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";
import { DropSelect, Modal } from "@shared/ui/libs";

const PAGE_SIZE = 18;

interface AssetPickerModalProps {
  isOpen: boolean;
  onSelect: (url: string) => void;
  onClose: () => void;
  priorityUrls?: string[];
}

export function AssetPickerModal({
  isOpen,
  onSelect,
  onClose,
  priorityUrls = [],
}: AssetPickerModalProps) {
  const [page, setPage] = useState(1);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPostFirst, setCurrentPostFirst] = useState(true);

  const trimmedSearch = search.trim();
  const priorityUrlSet = useMemo(
    () =>
      new Set(
        priorityUrls
          .map((url) => toCanonicalAssetUrl(url))
          .filter((url) => url.length > 0),
      ),
    [priorityUrls],
  );

  const categoriesQuery = useQuery({
    queryKey: adminAssetKeys.categories(),
    queryFn: fetchAssetCategories,
    enabled: isOpen,
  });

  const assetsQuery = useQuery({
    queryKey: adminAssetKeys.list({
      page,
      limit: PAGE_SIZE,
      categoryId,
      q: trimmedSearch,
    }),
    queryFn: () =>
      fetchAssets({
        page,
        limit: PAGE_SIZE,
        categoryId,
        q: trimmedSearch || undefined,
      }),
    enabled: isOpen,
  });

  const rawAssets = assetsQuery.data?.data ?? [];
  const assets = useMemo(() => {
    if (!currentPostFirst || priorityUrlSet.size === 0) {
      return rawAssets;
    }

    return [...rawAssets].sort((left, right) => {
      const leftPriority = priorityUrlSet.has(toCanonicalAssetUrl(left.url));
      const rightPriority = priorityUrlSet.has(toCanonicalAssetUrl(right.url));

      if (leftPriority === rightPriority) {
        return 0;
      }

      return leftPriority ? -1 : 1;
    });
  }, [currentPostFirst, priorityUrlSet, rawAssets]);
  const meta = assetsQuery.data?.meta;
  const categories = categoriesQuery.data ?? [];
  const selectedAsset =
    assets.find((asset) => asset.id === selectedAssetId) ?? null;

  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setSelectedAssetId(null);
      setCategoryId(null);
      setSearch("");
      setCurrentPostFirst(true);
    }
  }, [isOpen]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, trimmedSearch]);

  useEffect(() => {
    setSelectedAssetId((current) =>
      current && rawAssets.some((asset) => asset.id === current)
        ? current
        : null,
    );
  }, [rawAssets]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      withBackground
      aria-label="에셋 선택"
      className="w-[min(94vw,72rem)] p-0 text-left max-sm:w-screen max-sm:max-w-none"
    >
      <div className="flex h-[min(88vh,56rem)] flex-col overflow-hidden rounded-3xl bg-background-1 max-sm:h-dvh max-sm:rounded-none">
        <div className="border-b border-border-3 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
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

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <CategoryChips
              categories={categories}
              selectedCategoryId={categoryId}
              totalCount={meta?.total}
              onSelect={setCategoryId}
            />
            <SelectedAssetSummary asset={selectedAsset} />
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_10rem] lg:grid-cols-[minmax(0,1fr)_12rem_10rem]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="별명 또는 파일명 검색"
              className="h-10 rounded-xl border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
            />
            <DropSelect
              value={categoryId === null ? "" : String(categoryId)}
              onChange={(value) => setCategoryId(value ? Number(value) : null)}
              className="w-full"
              triggerClassName="h-10 rounded-xl text-sm text-text-2"
              ariaLabel="에셋 카테고리"
              options={[
                { label: "전체 카테고리", value: "" },
                ...categories.map((category) => ({
                  label: category.name,
                  value: String(category.id),
                })),
              ]}
            />
            <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-border-3 px-3 text-sm text-text-2">
              <input
                type="checkbox"
                checked={currentPostFirst}
                disabled={priorityUrlSet.size === 0}
                onChange={(event) => setCurrentPostFirst(event.target.checked)}
                className="accent-primary-1"
              />
              현재 글 우선
            </label>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {categoriesQuery.isError ? (
            <div className="mb-4 rounded-2xl border border-warning-1/20 bg-warning-1/10 px-4 py-3 text-sm text-warning-1">
              {getErrorMessage(
                categoriesQuery.error,
                "에셋 카테고리를 불러오지 못했습니다.",
              )}
            </div>
          ) : null}

          {assetsQuery.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-4/3 animate-pulse rounded-[1.25rem] bg-background-2"
                />
              ))}
            </div>
          ) : null}

          {assetsQuery.isError ? (
            <div className="rounded-2xl border border-negative-1/20 bg-negative-1/5 px-4 py-3 text-sm text-negative-1">
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
                표시할 에셋이 없습니다.
              </p>
              <p className="mt-2 text-sm text-text-4">
                검색어 또는 카테고리 필터를 변경해 보세요.
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
                  isPriority={priorityUrlSet.has(
                    toCanonicalAssetUrl(asset.url),
                  )}
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
                : `총 ${meta.total}개 중 ${(meta.page - 1) * meta.limit + 1}-${(meta.page - 1) * meta.limit + rawAssets.length}`
              : "페이지 정보를 불러오는 중입니다."}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!meta || meta.page <= 1}
              className="inline-flex items-center justify-center rounded-xl border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex items-center justify-center rounded-xl border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => selectedAsset && onSelect(selectedAsset.url)}
              disabled={!selectedAsset}
              className="inline-flex items-center justify-center rounded-xl bg-primary-1 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              선택
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CategoryChips({
  categories,
  selectedCategoryId,
  totalCount,
  onSelect,
}: {
  categories: AssetCategory[];
  selectedCategoryId: number | null;
  totalCount?: number;
  onSelect: (id: number | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
          selectedCategoryId === null
            ? "border-primary-1/30 bg-primary-1/10 text-primary-1"
            : "border-border-4 bg-background-1 text-text-2 hover:border-border-3 hover:bg-background-3",
        )}
      >
        전체
        {totalCount !== undefined ? (
          <span className="text-xs opacity-70">{totalCount}</span>
        ) : null}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
            selectedCategoryId === category.id
              ? getAssetCategoryTone(category)
              : "border-border-4 bg-background-1 text-text-2 hover:border-border-3 hover:bg-background-3",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              category.key === "thumbnail" && "bg-primary-1",
              category.key === "default" && "bg-positive-1",
              category.key === "uncategorized" && "bg-text-4",
              !category.key && "bg-info-1",
            )}
          />
          {category.name}
        </button>
      ))}
    </div>
  );
}

function SelectedAssetSummary({ asset }: { asset: Asset | null }) {
  if (!asset) {
    return (
      <div className="flex min-h-16 items-center rounded-2xl border border-border-4 bg-background-2 px-4 text-sm text-text-4">
        선택된 에셋이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-border-4 bg-background-2 p-3">
      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-background-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin asset hosts are allowed */}
        <img
          src={normalizeAssetUrl(asset.url)}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-1">
          {getAssetDisplayName(asset)}
        </p>
        <p className="truncate text-xs text-text-4">
          {getAssetFilename(asset.url)}
        </p>
      </div>
    </div>
  );
}

function AssetPickerCard({
  asset,
  isPriority,
  isSelected,
  onSelect,
}: {
  asset: Asset;
  isPriority: boolean;
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
      <div className="relative aspect-4/3 overflow-hidden bg-background-3">
        {hasError ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-text-4">
            미리보기 실패
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin asset hosts are allowed
          <img
            src={asset.url}
            alt={getAssetDisplayName(asset)}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
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
          {isPriority ? (
            <span className="inline-flex min-h-8 items-center rounded-full border border-primary-1/25 bg-background-1/85 px-2 text-xs font-semibold text-primary-1 backdrop-blur">
              현재 글
            </span>
          ) : null}
        </div>
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-1">
              {getAssetDisplayName(asset)}
            </p>
            <p className="truncate text-xs text-text-4">
              {getAssetFilename(asset.url)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold",
              getAssetCategoryTone(asset.category),
            )}
          >
            {asset.category.name}
          </span>
        </div>
        <p className="text-xs text-text-4">
          {formatAssetFileSize(asset.sizeBytes)} ·{" "}
          {formatAssetResolution(asset.width, asset.height)}
        </p>
      </div>
    </button>
  );
}
