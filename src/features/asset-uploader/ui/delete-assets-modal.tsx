import { Modal, Spinner } from "@shared/ui/libs";

interface DeleteAssetsModalProps {
  ids: number[];
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAssetsModal({
  ids,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteAssetsModalProps) {
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
