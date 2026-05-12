import type { AssetCategory } from "@entities/asset";
import { DropSelect } from "@shared/ui/libs";

interface AssetToolbarProps {
  search: string;
  categoryFilterId: number | null;
  categories: AssetCategory[];
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (categoryId: number | null) => void;
  onResetFilters: () => void;
}

export function AssetToolbar({
  search,
  categoryFilterId,
  categories,
  onSearchChange,
  onCategoryFilterChange,
  onResetFilters,
}: AssetToolbarProps) {
  return (
    <section className="rounded-2xl border border-border-4 bg-background-2 p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="별명 또는 파일명 검색"
          className="h-10 rounded-xl border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
        />
        <DropSelect
          value={categoryFilterId === null ? "" : String(categoryFilterId)}
          onChange={(value) =>
            onCategoryFilterChange(value ? Number(value) : null)
          }
          ariaLabel="카테고리 필터"
          className="w-full"
          triggerClassName="h-10 rounded-[0.75rem] text-sm text-text-2"
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
