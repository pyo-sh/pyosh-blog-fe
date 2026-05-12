import type { AssetCategory } from "@entities/asset";
import { ChevronIcon } from "@shared/ui/icons";
import { DropSelect } from "@shared/ui/libs";

interface AssetToolbarProps {
  search: string;
  categoryFilterId: number | null;
  categories: AssetCategory[];
  isUploadPanelOpen: boolean;
  uploadQueueCount: number;
  isUploadPanelPinned: boolean;
  onToggleUploadPanel: () => void;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (categoryId: number | null) => void;
  onResetFilters: () => void;
}

export function AssetToolbar({
  search,
  categoryFilterId,
  categories,
  isUploadPanelOpen,
  uploadQueueCount,
  isUploadPanelPinned,
  onToggleUploadPanel,
  onSearchChange,
  onCategoryFilterChange,
  onResetFilters,
}: AssetToolbarProps) {
  return (
    <section className="border-b border-border-4 pb-6">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
        <div className="flex min-w-0 gap-2">
          <button
            type="button"
            onClick={onToggleUploadPanel}
            aria-pressed={isUploadPanelOpen}
            aria-controls="asset-upload-panel"
            disabled={isUploadPanelPinned}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border-3 px-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-60 data-[active=true]:border-primary-1 data-[active=true]:bg-primary-1 data-[active=true]:text-white"
            data-active={isUploadPanelOpen ? "true" : "false"}
          >
            업로드
            {uploadQueueCount > 0 ? (
              <span className="ml-1 text-xs">({uploadQueueCount})</span>
            ) : null}
            <ChevronIcon
              direction={isUploadPanelOpen ? "up" : "down"}
              size="14"
              className="shrink-0"
            />
          </button>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="별명 또는 파일명 검색"
            className="h-10 min-w-0 flex-1 rounded-xl border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
          />
        </div>
        <DropSelect
          value={categoryFilterId === null ? "" : String(categoryFilterId)}
          onChange={(value) =>
            onCategoryFilterChange(value ? Number(value) : null)
          }
          ariaLabel="카테고리 필터"
          className="w-full"
          triggerClassName="h-10 rounded-xl text-sm text-text-2"
          options={[
            { label: "전체 카테고리", value: "" },
            ...categories.map((category) => ({
              label: category.name,
              value: String(category.id),
            })),
          ]}
        />
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border-3 px-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          필터 초기화
        </button>
      </div>
    </section>
  );
}
