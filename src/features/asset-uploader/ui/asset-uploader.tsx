"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AssetBulkActionBar } from "./asset-bulk-action-bar";
import { AssetCategoryManagerModal } from "./asset-category-manager-modal";
import { AssetDetailModal } from "./asset-detail-modal";
import { AssetGrid } from "./asset-grid";
import { AssetGridSkeleton } from "./asset-grid-skeleton";
import { AssetPagination } from "./asset-pagination";
import { AssetToolbar } from "./asset-toolbar";
import { DeleteAssetsModal } from "./delete-assets-modal";
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
      <UploadZone
        files={pendingFiles}
        isUploading={uploadMutation.isPending}
        uploadProgress={uploadProgress}
        errorMessage={null}
        categories={categories}
        defaultCategoryId={selectedUploadCategoryId}
        isDefaultCategoryDisabled={
          categoriesQuery.isPending || uploadMutation.isPending
        }
        onFilesAdded={addFiles}
        onDefaultCategoryChange={setDefaultUploadCategoryId}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
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
            className="mt-4 inline-flex rounded-xl border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
          >
            다시 시도
          </button>
        </section>
      ) : null}

      {!assetsQuery.isPending && !assetsQuery.isError ? (
        <>
          <AssetToolbar
            search={search}
            categoryFilterId={categoryFilterId}
            categories={categories}
            onSearchChange={setSearch}
            onCategoryFilterChange={setCategoryFilterId}
            onResetFilters={() => {
              setSearch("");
              setCategoryFilterId(null);
            }}
          />

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
              <AssetBulkActionBar
                selectedCount={selectedIds.length}
                categories={categories}
                bulkCategoryId={bulkCategoryId}
                isApplyingCategory={bulkCategoryMutation.isPending}
                isDeleting={deleteMutation.isPending}
                isPageFullySelected={
                  assets.length > 0 &&
                  assets.every((asset) => selectedIds.includes(asset.id))
                }
                onBulkCategoryChange={setBulkCategoryId}
                onApplyCategory={() => {
                  if (bulkCategoryId === null) {
                    toast.error("변경할 카테고리를 선택하세요.");

                    return;
                  }

                  bulkCategoryMutation.mutate({
                    ids: selectedIds,
                    categoryId: bulkCategoryId,
                  });
                }}
                onToggleSelectAll={() =>
                  selectAll(
                    !assets.every((asset) => selectedIds.includes(asset.id)),
                  )
                }
                onRequestDelete={() => requestDelete(selectedIds)}
                onDone={exitSelectionMode}
              />
            ) : null}
            {meta ? (
              <AssetPagination
                page={page}
                totalPages={meta.totalPages}
                isFetching={assetsQuery.isFetching && !assetsQuery.isPending}
                onPageChange={handlePageChange}
              />
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
