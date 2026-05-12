import type { AssetCategory } from "@entities/asset";

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
    <section className="rounded-[1rem] border border-border-4 bg-background-2 p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="별명 또는 파일명 검색"
          className="h-10 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
        />
        <select
          value={categoryFilterId ?? ""}
          onChange={(event) =>
            onCategoryFilterChange(
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
          onClick={onResetFilters}
          className="inline-flex h-10 items-center justify-center rounded-[0.75rem] border border-border-3 px-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          필터 초기화
        </button>
      </div>
    </section>
  );
}
