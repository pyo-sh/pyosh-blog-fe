import type { AssetCategory } from "@entities/asset";

interface AssetBulkActionBarProps {
  selectedCount: number;
  categories: AssetCategory[];
  bulkCategoryId: number | null;
  isApplyingCategory: boolean;
  isDeleting: boolean;
  isPageFullySelected: boolean;
  onBulkCategoryChange: (categoryId: number | null) => void;
  onApplyCategory: () => void;
  onToggleSelectAll: () => void;
  onRequestDelete: () => void;
  onDone: () => void;
}

export function AssetBulkActionBar({
  selectedCount,
  categories,
  bulkCategoryId,
  isApplyingCategory,
  isDeleting,
  isPageFullySelected,
  onBulkCategoryChange,
  onApplyCategory,
  onToggleSelectAll,
  onRequestDelete,
  onDone,
}: AssetBulkActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 md:left-[var(--admin-sidebar-offset)]">
      <div className="flex flex-wrap items-center gap-3 border-t border-border-3 bg-[rgba(241,242,243,0.95)] px-4 py-3 backdrop-blur-[12px] md:px-6 dark:bg-[rgba(19,20,21,0.94)]">
        <span className="text-sm font-medium text-text-1">
          선택됨 {selectedCount}개
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={bulkCategoryId ?? ""}
            onChange={(event) =>
              onBulkCategoryChange(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            disabled={selectedCount === 0 || isApplyingCategory}
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
            onClick={onApplyCategory}
            disabled={
              selectedCount === 0 ||
              bulkCategoryId === null ||
              isApplyingCategory
            }
            className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:bg-background-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isApplyingCategory ? "변경 중" : "카테고리 적용"}
          </button>
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="cursor-pointer px-2 py-1.5 text-sm text-primary-1 transition-colors hover:text-primary-1/80"
          >
            {isPageFullySelected ? "전체 해제" : "전체 선택"}
          </button>
          <button
            type="button"
            onClick={onRequestDelete}
            disabled={selectedCount === 0 || isDeleting}
            className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-negative-1/30 px-3 text-sm text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={onDone}
            className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] bg-primary-1 px-3 text-sm text-white transition-opacity hover:opacity-90"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
