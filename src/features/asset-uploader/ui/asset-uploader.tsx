"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AssetCategoryManagerModal } from "./asset-category-manager-modal";
import { AssetDetailModal } from "./asset-detail-modal";
import { AssetGrid } from "./asset-grid";
import { type PendingUploadFile, UploadZone } from "./upload-zone";
import {
  adminAssetKeys,
  buildAssetMarkdown,
  createAssetCategory,
  deleteAsset,
  deleteAssetCategory,
  deleteAssets,
  fetchAssetCategories,
  fetchAssets,
  findAssetCategoryByKey,
  getInitialAssetDisplayName,
  updateAsset,
  updateAssetCategory,
  updateAssetsCategory,
  uploadAssets,
  type Asset,
  type AssetCategory,
} from "@entities/asset";
import { toCanonicalAssetUrl } from "@shared/lib/asset-url";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { Modal, Spinner } from "@shared/ui/libs";

const PAGE_SIZE = 18;
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);
const EMPTY_ASSETS: Asset[] = [];

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  windowSize: number,
): Array<number | "..."> {
  if (totalPages <= 1) return [1];

  const windowStart = Math.max(2, currentPage - windowSize);
  const windowEnd = Math.min(totalPages - 1, currentPage + windowSize);
  const pages: Array<number | "..."> = [1];

  if (windowStart > 2) pages.push("...");
  for (let index = windowStart; index <= windowEnd; index += 1) {
    pages.push(index);
  }
  if (windowEnd < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

export function AssetUploader() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [categoryFilterId, setCategoryFilterId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [defaultUploadCategoryId, setDefaultUploadCategoryId] = useState<
    number | null
  >(null);
  const [bulkCategoryId, setBulkCategoryId] = useState<number | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<number | null>(
    null,
  );
  const [pendingFiles, setPendingFiles] = useState<PendingUploadFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null,
  );
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[]>([]);
  const [detailDeleteIndex, setDetailDeleteIndex] = useState<number | null>(
    null,
  );
  const [detailAssetId, setDetailAssetId] = useState<number | null>(null);
  const [copiedState, setCopiedState] = useState<{
    id: number;
    type: "url" | "markdown";
  } | null>(null);
  const trimmedSearch = search.trim();

  const categoriesQuery = useQuery({
    queryKey: adminAssetKeys.categories(),
    queryFn: fetchAssetCategories,
  });

  const assetsQuery = useQuery({
    queryKey: adminAssetKeys.list({
      page,
      limit: PAGE_SIZE,
      categoryId: categoryFilterId,
      q: trimmedSearch,
    }),
    queryFn: () =>
      fetchAssets({
        page,
        limit: PAGE_SIZE,
        categoryId: categoryFilterId,
        q: trimmedSearch || undefined,
      }),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: PendingUploadFile[]) => {
      setUploadProgress(0);

      return uploadAssets(
        files.map((item) => item.file),
        setUploadProgress,
        files.map((item) => ({
          displayName: item.displayName.trim() || null,
          categoryId: item.categoryId ?? undefined,
        })),
      );
    },
    onSuccess: async () => {
      toast.success(
        "업로드가 완료되었습니다. 최신 에셋을 맨 위에서 확인하세요.",
      );
      setUploadProgress(null);
      setPage(1);
      clearPendingFiles();
      await queryClient.invalidateQueries({ queryKey: adminAssetKeys.all() });
    },
    onError: (error) => {
      setUploadProgress(null);
      toast.error(getErrorMessage(error, "에셋 업로드에 실패했습니다."));
    },
  });

  const assets = assetsQuery.data?.data ?? EMPTY_ASSETS;
  const meta = assetsQuery.data?.meta;
  const categories = categoriesQuery.data ?? [];
  const fallbackDefaultCategory =
    findAssetCategoryByKey(categories, "default") ?? categories[0] ?? null;
  const selectedUploadCategoryId =
    defaultUploadCategoryId ?? fallbackDefaultCategory?.id ?? null;

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      if (ids.length === 1) {
        await deleteAsset(ids[0]);
      } else {
        await deleteAssets(ids);
      }

      return ids;
    },
    onSuccess: async (deletedIds) => {
      const deletedSet = new Set(deletedIds);

      if (deletedIds.length === 1) {
        toast.success("에셋을 삭제했습니다.");
      } else {
        toast.success(`${deletedIds.length}개의 에셋을 삭제했습니다.`);
      }

      if (
        detailDeleteIndex !== null &&
        detailAssetId !== null &&
        deletedSet.has(detailAssetId)
      ) {
        const remainingAssets = assets.filter(
          (asset) => !deletedSet.has(asset.id),
        );
        const nextAsset =
          remainingAssets[detailDeleteIndex] ??
          remainingAssets[detailDeleteIndex - 1] ??
          null;
        setDetailAssetId(nextAsset?.id ?? null);
      }

      setDeleteTargetIds([]);
      setDetailDeleteIndex(null);
      setSelectedIds((current) => current.filter((id) => !deletedSet.has(id)));

      await queryClient.invalidateQueries({ queryKey: adminAssetKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "에셋 삭제에 실패했습니다."));
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({
      assetId,
      displayName,
      categoryId,
    }: {
      assetId: number;
      displayName: string | null;
      categoryId: number;
    }) => updateAsset(assetId, { displayName, categoryId }),
    onSuccess: async () => {
      toast.success("에셋 정보를 저장했습니다.");
      await queryClient.invalidateQueries({ queryKey: adminAssetKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "에셋 정보 저장에 실패했습니다."));
    },
  });

  const bulkCategoryMutation = useMutation({
    mutationFn: ({ ids, categoryId }: { ids: number[]; categoryId: number }) =>
      updateAssetsCategory(ids, categoryId),
    onSuccess: async (_, variables) => {
      toast.success(
        `${variables.ids.length}개의 에셋 카테고리를 변경했습니다.`,
      );
      setSelectedIds([]);
      setLastSelectedIndex(null);
      setBulkCategoryId(null);
      await queryClient.invalidateQueries({ queryKey: adminAssetKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "카테고리 일괄 변경에 실패했습니다."));
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createAssetCategory,
    onSuccess: async () => {
      toast.success("에셋 카테고리를 추가했습니다.");
      await queryClient.invalidateQueries({
        queryKey: adminAssetKeys.categories(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "카테고리 추가에 실패했습니다."));
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateAssetCategory(id, { name }),
    onMutate: (variables) => {
      setPendingCategoryId(variables.id);
    },
    onSuccess: async () => {
      toast.success("에셋 카테고리를 저장했습니다.");
      await queryClient.invalidateQueries({
        queryKey: adminAssetKeys.categories(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "카테고리 저장에 실패했습니다."));
    },
    onSettled: () => {
      setPendingCategoryId(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteAssetCategory,
    onMutate: (id) => {
      setPendingCategoryId(id);
    },
    onSuccess: async () => {
      toast.success(
        "에셋 카테고리를 삭제했습니다. 연결된 에셋은 미분류로 이동했습니다.",
      );
      setCategoryFilterId(null);
      await queryClient.invalidateQueries({ queryKey: adminAssetKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "카테고리 삭제에 실패했습니다."));
    },
    onSettled: () => {
      setPendingCategoryId(null);
    },
  });

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
    setLastSelectedIndex(null);
    setSelectionMode(false);
  }, [categoryFilterId, trimmedSearch]);

  useEffect(() => {
    if (defaultUploadCategoryId !== null) {
      return;
    }

    const defaultCategory = findAssetCategoryByKey(categories, "default");
    if (defaultCategory) {
      setDefaultUploadCategoryId(defaultCategory.id);
    }
  }, [categories, defaultUploadCategoryId]);

  useEffect(() => {
    if (
      bulkCategoryId !== null &&
      !categories.some((category) => category.id === bulkCategoryId)
    ) {
      setBulkCategoryId(null);
    }
  }, [bulkCategoryId, categories]);

  useEffect(() => {
    setSelectedIds((current) => {
      const next = current.filter((id) =>
        assets.some((asset) => asset.id === id),
      );

      return next.length === current.length &&
        next.every((id, index) => id === current[index])
        ? current
        : next;
    });
  }, [assets]);

  useEffect(() => {
    if (detailAssetId && !assets.some((asset) => asset.id === detailAssetId)) {
      setDetailAssetId(null);
    }
  }, [assets, detailAssetId]);

  useEffect(() => {
    if (!selectionMode) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exitSelectionMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectionMode]);

  useEffect(() => {
    if (!copiedState) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopiedState(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [copiedState]);

  const pageNumbers = meta ? generatePageNumbers(page, meta.totalPages, 2) : [];

  function clearPendingFiles() {
    setPendingFiles((current) => {
      current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      return [];
    });
  }

  function addFiles(inputFiles: FileList | File[]) {
    const incoming = Array.from(inputFiles);

    if (incoming.length === 0) {
      return;
    }

    setPendingFiles((current) => {
      const next = [...current];

      for (const file of incoming) {
        if (next.length >= MAX_FILES) {
          toast.error(
            `최대 ${MAX_FILES}개까지 업로드 대기열에 담을 수 있습니다.`,
          );
          break;
        }

        if (!ACCEPTED_TYPES.has(file.type)) {
          toast.error(`지원하지 않는 파일 형식입니다: ${file.name}`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error(
            `10MB를 초과하는 파일은 업로드할 수 없습니다: ${file.name}`,
          );
          continue;
        }

        const duplicate = next.some(
          (item) =>
            item.file.name === file.name &&
            item.file.size === file.size &&
            item.file.lastModified === file.lastModified,
        );

        if (duplicate) {
          continue;
        }

        next.push({
          id: `${file.name}-${file.lastModified}-${file.size}`,
          file,
          displayName: getInitialAssetDisplayName(file.name),
          categoryId: selectedUploadCategoryId,
          previewUrl:
            file.type === "image/svg+xml"
              ? undefined
              : URL.createObjectURL(file),
        });
      }

      return next;
    });
  }

  function updatePendingFileMetadata(
    id: string,
    metadata: { displayName?: string; categoryId?: number | null },
  ) {
    setPendingFiles((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              displayName: metadata.displayName ?? item.displayName,
              categoryId:
                metadata.categoryId !== undefined
                  ? metadata.categoryId
                  : item.categoryId,
            }
          : item,
      ),
    );
  }

  function removePendingFile(id: string) {
    setPendingFiles((current) =>
      current.filter((item) => {
        if (item.id === id && item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }

        return item.id !== id;
      }),
    );
  }

  function enterSelectionMode() {
    setSelectionMode(true);
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds([]);
    setLastSelectedIndex(null);
  }

  function toggleSelect(
    id: number,
    index: number,
    options: { shiftKey: boolean } = { shiftKey: false },
  ) {
    setSelectedIds((current) => {
      if (
        options.shiftKey &&
        lastSelectedIndex !== null &&
        assets[lastSelectedIndex]
      ) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = assets.slice(start, end + 1).map((asset) => asset.id);
        const next = new Set(current);

        rangeIds.forEach((rangeId) => next.add(rangeId));

        return Array.from(next);
      }

      return current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];
    });

    setLastSelectedIndex(index);
  }

  function selectAll(checked: boolean) {
    setSelectedIds(checked ? assets.map((asset) => asset.id) : []);
    setLastSelectedIndex(
      checked && assets.length > 0 ? assets.length - 1 : null,
    );
  }

  async function handleCopy(asset: Asset, type: "url" | "markdown") {
    const text =
      type === "url"
        ? toCanonicalAssetUrl(asset.url)
        : buildAssetMarkdown(asset);

    try {
      await navigator.clipboard.writeText(text);
      setCopiedState({ id: asset.id, type });
      toast.info(
        type === "url" ? "URL을 복사했습니다." : "마크다운을 복사했습니다.",
      );
    } catch {
      toast.error("클립보드 복사에 실패했습니다.");
    }
  }

  function requestDelete(ids: number[]) {
    if (ids.length === 0) {
      return;
    }

    setDeleteTargetIds(ids);
  }

  function requestDeleteFromDetail(asset: Asset) {
    setDetailDeleteIndex(assets.findIndex((item) => item.id === asset.id));
    setDeleteTargetIds([asset.id]);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    setSelectedIds([]);
    setLastSelectedIndex(null);
    setSelectionMode(false);
  }

  function handleRenameCategory(category: AssetCategory, name: string) {
    const trimmed = name.trim();
    if (!trimmed || trimmed === category.name) {
      return;
    }

    updateCategoryMutation.mutate({ id: category.id, name: trimmed });
  }

  function handleDeleteCategory(category: AssetCategory) {
    if (category.isProtected) {
      return;
    }

    deleteCategoryMutation.mutate(category.id);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1rem] border border-border-4 bg-background-2 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-1">업로드 기본값</p>
            <p className="mt-1 text-xs text-text-4">
              에셋 관리에서 직접 추가하는 파일은 선택한 카테고리로 대기열에
              들어갑니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedUploadCategoryId ?? ""}
              onChange={(event) =>
                setDefaultUploadCategoryId(
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              disabled={categoriesQuery.isPending || uploadMutation.isPending}
              className="h-10 min-w-[12rem] rounded-[0.75rem] border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="업로드 기본 카테고리"
            >
              {categories.length === 0 ? <option value="">기본</option> : null}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsCategoryManagerOpen(true)}
              className="inline-flex h-10 items-center justify-center rounded-[0.75rem] border border-border-3 px-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
            >
              카테고리 관리
            </button>
          </div>
        </div>
      </section>

      <UploadZone
        files={pendingFiles}
        isUploading={uploadMutation.isPending}
        uploadProgress={uploadProgress}
        errorMessage={null}
        categories={categories}
        onFilesAdded={addFiles}
        onUpdateFileMetadata={updatePendingFileMetadata}
        onRemoveFile={removePendingFile}
        onClear={clearPendingFiles}
        onUpload={() => {
          if (pendingFiles.length === 0) {
            toast.error("업로드할 파일을 먼저 선택하세요.");

            return;
          }

          uploadMutation.mutate(pendingFiles);
        }}
      />

      {assetsQuery.isPending ? <AssetGridSkeleton /> : null}

      {!assetsQuery.isPending && assetsQuery.isError ? (
        <section className="rounded-[1.75rem] border border-negative-1/20 bg-negative-1/10 px-6 py-10 text-center">
          <p className="text-sm text-negative-1">
            {getErrorMessage(
              assetsQuery.error,
              "에셋 목록을 불러오지 못했습니다.",
            )}
          </p>
          <button
            type="button"
            onClick={() => void assetsQuery.refetch()}
            className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
          >
            다시 시도
          </button>
        </section>
      ) : null}

      {!assetsQuery.isPending && !assetsQuery.isError ? (
        <>
          <section className="rounded-[1rem] border border-border-4 bg-background-2 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="별명 또는 파일명 검색"
                className="h-10 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
              />
              <select
                value={categoryFilterId ?? ""}
                onChange={(event) =>
                  setCategoryFilterId(
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                className="h-10 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors focus:border-primary-1"
                aria-label="카테고리 필터"
              >
                <option value="">전체 카테고리</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilterId(null);
                }}
                className="inline-flex h-10 items-center justify-center rounded-[0.75rem] border border-border-3 px-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
              >
                필터 초기화
              </button>
            </div>
          </section>

          <AssetGrid
            assets={assets}
            totalCount={meta?.total ?? assets.length}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            deletingIds={
              deleteMutation.isPending ? (deleteMutation.variables ?? []) : []
            }
            copiedAssetId={copiedState?.type === "url" ? copiedState.id : null}
            isPending={deleteMutation.isPending}
            onEnterSelectionMode={enterSelectionMode}
            onToggleSelect={toggleSelect}
            onCopyUrl={(asset) => void handleCopy(asset, "url")}
            onOpenDetail={setDetailAssetId}
          />
          <div className="flex flex-col gap-4">
            {selectionMode ? (
              <div className="fixed bottom-0 left-0 right-0 z-20 md:left-[var(--admin-sidebar-offset)]">
                <div className="flex flex-wrap items-center gap-3 border-t border-border-3 bg-[rgba(241,242,243,0.95)] px-4 py-3 backdrop-blur-[12px] md:px-6 dark:bg-[rgba(19,20,21,0.94)]">
                  <span className="text-sm font-medium text-text-1">
                    선택됨 {selectedIds.length}개
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <select
                      value={bulkCategoryId ?? ""}
                      onChange={(event) =>
                        setBulkCategoryId(
                          event.target.value
                            ? Number(event.target.value)
                            : null,
                        )
                      }
                      disabled={
                        selectedIds.length === 0 ||
                        bulkCategoryMutation.isPending
                      }
                      className="h-9 rounded-[0.7rem] border border-border-3 bg-background-1 px-2 text-sm text-text-2 outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="선택 에셋 카테고리"
                    >
                      <option value="">카테고리 변경</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (bulkCategoryId === null) {
                          toast.error("변경할 카테고리를 선택하세요.");

                          return;
                        }

                        bulkCategoryMutation.mutate({
                          ids: selectedIds,
                          categoryId: bulkCategoryId,
                        });
                      }}
                      disabled={
                        selectedIds.length === 0 ||
                        bulkCategoryId === null ||
                        bulkCategoryMutation.isPending
                      }
                      className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:bg-background-1 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {bulkCategoryMutation.isPending
                        ? "변경 중"
                        : "카테고리 적용"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectAll(
                          !assets.every((asset) =>
                            selectedIds.includes(asset.id),
                          ),
                        )
                      }
                      className="cursor-pointer px-2 py-1.5 text-sm text-primary-1 transition-colors hover:text-primary-1/80"
                    >
                      {assets.length > 0 &&
                      assets.every((asset) => selectedIds.includes(asset.id))
                        ? "전체 해제"
                        : "전체 선택"}
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDelete(selectedIds)}
                      disabled={
                        selectedIds.length === 0 || deleteMutation.isPending
                      }
                      className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-negative-1/30 px-3 text-sm text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      삭제
                    </button>
                    <button
                      type="button"
                      onClick={exitSelectionMode}
                      className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] bg-primary-1 px-3 text-sm text-white transition-opacity hover:opacity-90"
                    >
                      완료
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            {meta ? (
              <nav
                aria-label="관리자 에셋 페이지네이션"
                className="flex items-center justify-center gap-0.5"
              >
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(1, page - 5))}
                  disabled={page <= 5}
                  className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
                  aria-label="5 pages back"
                >
                  &laquo;
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
                  aria-label="Previous page"
                >
                  &lsaquo;
                </button>
                {pageNumbers.map((pageNumber, index) =>
                  pageNumber === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-4"
                      aria-hidden="true"
                    >
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={pageNumber === page}
                      className={
                        pageNumber === page
                          ? "pointer-events-none inline-flex min-w-[2rem] items-center justify-center rounded bg-primary-1 px-2.5 py-1.5 text-sm font-semibold text-white"
                          : "inline-flex min-w-[2rem] items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2"
                      }
                      aria-current={pageNumber === page ? "page" : undefined}
                      aria-label={`Page ${pageNumber}`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(Math.min(meta.totalPages, page + 1))
                  }
                  disabled={page === meta.totalPages}
                  className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
                  aria-label="Next page"
                >
                  &rsaquo;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(Math.min(meta.totalPages, page + 5))
                  }
                  disabled={page + 5 > meta.totalPages}
                  className="inline-flex items-center justify-center rounded px-2.5 py-1.5 text-sm text-text-1 transition-colors hover:bg-background-2 disabled:cursor-not-allowed disabled:text-text-4"
                  aria-label="5 pages forward"
                >
                  &raquo;
                </button>
              </nav>
            ) : null}
            {assetsQuery.isFetching && !assetsQuery.isPending ? (
              <p className="text-center text-sm text-text-3">
                목록을 새로 불러오는 중...
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      <DeleteAssetsModal
        ids={deleteTargetIds}
        isDeleting={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setDeleteTargetIds([]);
            setDetailDeleteIndex(null);
          }
        }}
        onConfirm={() => deleteMutation.mutate(deleteTargetIds)}
      />

      <AssetDetailModal
        assets={assets}
        categories={categories}
        assetId={deleteTargetIds.length > 0 ? null : detailAssetId}
        copiedType={copiedState?.id === detailAssetId ? copiedState.type : null}
        isSavingMetadata={updateAssetMutation.isPending}
        onClose={() => setDetailAssetId(null)}
        onCopy={(asset, type) => void handleCopy(asset, type)}
        onUpdateMetadata={(asset, metadata) =>
          updateAssetMutation.mutate({
            assetId: asset.id,
            displayName: metadata.displayName,
            categoryId: metadata.categoryId,
          })
        }
        onRequestDelete={requestDeleteFromDetail}
        onSelectAsset={setDetailAssetId}
      />

      <AssetCategoryManagerModal
        isOpen={isCategoryManagerOpen}
        categories={categories}
        pendingCategoryId={pendingCategoryId}
        isMutating={
          createCategoryMutation.isPending ||
          updateCategoryMutation.isPending ||
          deleteCategoryMutation.isPending
        }
        onClose={() => setIsCategoryManagerOpen(false)}
        onCreate={(name) => createCategoryMutation.mutate(name)}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
}

function DeleteAssetsModal({
  ids,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  ids: number[];
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      isOpen={ids.length > 0}
      onClose={onCancel}
      withBackground
      aria-label={ids.length === 1 ? "에셋 삭제 확인" : "에셋 일괄 삭제 확인"}
      className="w-[min(100%,30rem)] p-0 text-left"
    >
      <div className="border-b border-border-3 px-6 py-5">
        <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
          Delete assets
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-1">
          {ids.length === 1
            ? "이 에셋을 삭제할까요?"
            : `${ids.length}개의 에셋을 삭제할까요?`}
        </h2>
      </div>

      <div className="space-y-3 px-6 py-5 text-sm text-text-3">
        <p>
          삭제된 에셋은 복구되지 않으며, 에디터에서 이미 사용 중인 경우 깨진
          이미지가 생길 수 있습니다.
        </p>
        <p className="rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-negative-1">
          선택된 항목: {ids.join(", ")}
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-border-3 px-6 py-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex items-center justify-center rounded-[0.75rem] bg-negative-1 px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? (
            <>
              <Spinner size="sm" /> 삭제 중
            </>
          ) : (
            "삭제"
          )}
        </button>
      </div>
    </Modal>
  );
}

function AssetGridSkeleton() {
  return (
    <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.4rem] border border-border-3 bg-background-1"
          >
            <div className="aspect-[4/3] animate-pulse bg-background-3" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-background-3" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-background-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
