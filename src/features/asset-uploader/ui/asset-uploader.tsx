"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AssetGrid } from "./asset-grid";
import { type PendingUploadFile, UploadZone } from "./upload-zone";
import {
  deleteAsset,
  fetchAssets,
  uploadAssets,
  type Asset,
} from "@entities/asset";
import { ApiResponseError } from "@shared/api";
import { Modal } from "@shared/ui/libs";

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

export function AssetUploader() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pendingFiles, setPendingFiles] = useState<PendingUploadFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<{
    id: number;
    type: "url" | "markdown";
  } | null>(null);

  const assetsQuery = useQuery({
    queryKey: [...QUERY_KEY, page],
    queryFn: () => fetchAssets(page, PAGE_SIZE),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadAssets(files),
    onSuccess: async () => {
      setErrorMessage(null);
      setFeedbackMessage(
        "업로드가 완료되었습니다. 최신 에셋을 맨 위에서 확인하세요.",
      );
      setPage(1);
      clearPendingFiles();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error, "에셋 업로드에 실패했습니다."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => deleteAsset(id)),
      );
      const deletedIds: number[] = [];
      const failedIds: number[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          deletedIds.push(ids[index]);
        } else {
          failedIds.push(ids[index]);
        }
      });

      return { deletedIds, failedIds };
    },
    onSuccess: async ({ deletedIds, failedIds }) => {
      setErrorMessage(
        failedIds.length > 0
          ? failedIds.length === 1
            ? "일부 삭제에 실패했습니다. 목록을 새로고침했습니다."
            : `${failedIds.length}개 에셋 삭제에 실패했습니다. 목록을 새로고침했습니다.`
          : null,
      );

      if (deletedIds.length > 0) {
        setFeedbackMessage(
          deletedIds.length === 1
            ? "에셋을 삭제했습니다."
            : `${deletedIds.length}개의 에셋을 삭제했습니다.`,
        );
      }

      setDeleteTargetIds([]);
      setSelectedIds((current) =>
        current.filter((id) => !deletedIds.includes(id)),
      );
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error, "에셋 삭제에 실패했습니다."));
    },
  });

  const assets = assetsQuery.data?.data ?? [];
  const meta = assetsQuery.data?.meta;

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => assets.some((asset) => asset.id === id)),
    );
  }, [assets]);

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedbackMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [feedbackMessage]);

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

    setErrorMessage(null);

    setPendingFiles((current) => {
      const next = [...current];

      for (const file of incoming) {
        if (next.length >= MAX_FILES) {
          setErrorMessage(
            `최대 ${MAX_FILES}개까지 업로드 대기열에 담을 수 있습니다.`,
          );
          break;
        }

        if (!ACCEPTED_TYPES.has(file.type)) {
          setErrorMessage(`지원하지 않는 파일 형식입니다: ${file.name}`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          setErrorMessage(
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

  function toggleSelect(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function selectAll(checked: boolean) {
    setSelectedIds(checked ? assets.map((asset) => asset.id) : []);
  }

  async function handleCopy(asset: Asset, type: "url" | "markdown") {
    const text =
      type === "url" ? asset.url : `![${getFilename(asset.url)}](${asset.url})`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedState({ id: asset.id, type });
      setFeedbackMessage(
        type === "url" ? "URL을 복사했습니다." : "마크다운을 복사했습니다.",
      );
    } catch {
      setErrorMessage("클립보드 복사에 실패했습니다.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Assets
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-text-1">
            에셋 라이브러리
          </h1>
          <p className="mt-2 text-sm text-text-3">
            업로드 대기열을 확인한 뒤 배치 업로드하고, 갤러리에서 URL 또는
            마크다운을 복사하거나 여러 개를 선택해 삭제할 수 있습니다.
          </p>
        </div>

        <div className="rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-4">
          {assetsQuery.isFetching && !assetsQuery.isPending
            ? "목록을 새로 불러오는 중..."
            : paginationLabel}
        </div>
      </header>

      {feedbackMessage ? (
        <div className="rounded-[1rem] border border-primary-1/20 bg-primary-1/10 px-4 py-3 text-sm text-primary-1">
          {feedbackMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-sm text-negative-1">
          {errorMessage}
        </div>
      ) : null}

      <UploadZone
        files={pendingFiles}
        isUploading={uploadMutation.isPending}
        errorMessage={null}
        onFilesAdded={addFiles}
        onRemoveFile={removePendingFile}
        onClear={clearPendingFiles}
        onUpload={() => {
          if (pendingFiles.length === 0) {
            setErrorMessage("업로드할 파일을 먼저 선택하세요.");

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
            selectedIds={selectedIds}
            deletingIds={
              deleteMutation.isPending ? (deleteMutation.variables ?? []) : []
            }
            copiedState={copiedState}
            isPending={deleteMutation.isPending}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onCopy={handleCopy}
            onRequestDelete={setDeleteTargetIds}
          />
          <PaginationControls
            currentPage={meta?.page ?? 1}
            totalPages={meta?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      ) : null}

      <DeleteAssetsModal
        ids={deleteTargetIds}
        isDeleting={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setDeleteTargetIds([]);
          }
        }}
        onConfirm={() => deleteMutation.mutate(deleteTargetIds)}
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
          {isDeleting ? "삭제 중..." : "삭제"}
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
                ? "inline-flex h-10 min-w-10 items-center justify-center rounded-[0.85rem] bg-primary-1 px-3 text-sm font-semibold text-text-1"
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
              <div className="h-4 animate-pulse rounded-full bg-background-3" />
              <div className="h-3 animate-pulse rounded-full bg-background-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getFilename(url: string): string {
  const pathname = url.split("?")[0] ?? url;
  const parts = pathname.split("/");
  const segment = parts[parts.length - 1] || "asset";

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
