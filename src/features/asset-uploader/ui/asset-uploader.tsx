"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AssetDetailModal } from "./asset-detail-modal";
import { AssetGrid } from "./asset-grid";
import { type PendingUploadFile, UploadZone } from "./upload-zone";
import {
  buildAssetMarkdown,
  deleteAsset,
  deleteAssets,
  fetchAssets,
  uploadAssets,
  type Asset,
} from "@entities/asset";
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
const QUERY_KEY = ["admin-assets"] as const;
const EMPTY_ASSETS: Asset[] = [];

export function AssetUploader() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
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

  const assetsQuery = useQuery({
    queryKey: [...QUERY_KEY, page],
    queryFn: () => fetchAssets(page, PAGE_SIZE),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => {
      setUploadProgress(0);

      return uploadAssets(files, setUploadProgress);
    },
    onSuccess: async () => {
      toast.success(
        "업로드가 완료되었습니다. 최신 에셋을 맨 위에서 확인하세요.",
      );
      setUploadProgress(null);
      setPage(1);
      clearPendingFiles();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      setUploadProgress(null);
      toast.error(getErrorMessage(error, "에셋 업로드에 실패했습니다."));
    },
  });

  const assets = assetsQuery.data?.data ?? EMPTY_ASSETS;
  const meta = assetsQuery.data?.meta;

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

      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "에셋 삭제에 실패했습니다."));
    },
  });

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

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

  const paginationLabel = useMemo(() => {
    if (!meta || assets.length === 0) {
      return "표시할 에셋이 없습니다.";
    }

    const start = (meta.page - 1) * meta.limit + 1;
    const end = start + assets.length - 1;

    return `총 ${meta.total}개 중 ${start}-${end}`;
  }, [assets.length, meta]);

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
          previewUrl:
            file.type === "image/svg+xml"
              ? undefined
              : URL.createObjectURL(file),
        });
      }

      return next;
    });
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
    const text = type === "url" ? asset.url : buildAssetMarkdown(asset);

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

  return (
    <div className="space-y-6">
      <UploadZone
        files={pendingFiles}
        isUploading={uploadMutation.isPending}
        uploadProgress={uploadProgress}
        errorMessage={null}
        onFilesAdded={addFiles}
        onRemoveFile={removePendingFile}
        onClear={clearPendingFiles}
        onUpload={() => {
          if (pendingFiles.length === 0) {
            toast.error("업로드할 파일을 먼저 선택하세요.");

            return;
          }

          uploadMutation.mutate(pendingFiles.map((item) => item.file));
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
          <AssetGrid
            assets={assets}
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
            onRequestDelete={requestDelete}
          />
          <div className="flex flex-col gap-4">
            {selectionMode ? (
              <div className="fixed bottom-0 left-0 right-0 z-20 md:left-60">
                <div className="flex flex-wrap items-center gap-3 border-t border-border-3 bg-[rgba(241,242,243,0.95)] px-4 py-3 backdrop-blur-[12px] md:px-6 dark:bg-[rgba(19,20,21,0.94)]">
                  <span className="text-sm font-medium text-text-1">
                    선택됨 {selectedIds.length}개
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
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
            <PaginationControls
              currentPage={meta?.page ?? 1}
              totalPages={meta?.totalPages ?? 1}
              onPageChange={handlePageChange}
            />
            <p className="text-right text-sm text-text-3">
              {assetsQuery.isFetching && !assetsQuery.isPending
                ? "목록을 새로 불러오는 중..."
                : paginationLabel}
            </p>
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
        assetId={deleteTargetIds.length > 0 ? null : detailAssetId}
        copiedType={copiedState?.id === detailAssetId ? copiedState.type : null}
        onClose={() => setDetailAssetId(null)}
        onCopy={(asset, type) => void handleCopy(asset, type)}
        onRequestDelete={requestDeleteFromDetail}
        onSelectAsset={setDetailAssetId}
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

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Asset pagination"
      className="flex items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center rounded-[0.85rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        이전
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            disabled={page === currentPage}
            className={
              page === currentPage
                ? "inline-flex h-10 min-w-10 items-center justify-center rounded-[0.85rem] bg-primary-1 px-3 text-sm font-semibold text-white"
                : "inline-flex h-10 min-w-10 items-center justify-center rounded-[0.85rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
            }
          >
            {page}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center rounded-[0.85rem] border border-border-3 px-3 py-2 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        다음
      </button>
    </nav>
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
