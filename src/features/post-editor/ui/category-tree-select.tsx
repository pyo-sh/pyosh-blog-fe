"use client";

import type { Category } from "@entities/category";

interface CategoryTreeSelectProps {
  categories: Category[];
  value: number | null;
  disabled?: boolean;
  onChange: (value: number | null) => void;
}

interface CategoryOption {
  id: number;
  name: string;
  depth: number;
}

function flattenCategoryTree(
  categories: Category[],
  depth = 0,
): CategoryOption[] {
  return categories.flatMap((category) => [
    { id: category.id, name: category.name, depth },
    ...flattenCategoryTree(category.children ?? [], depth + 1),
  ]);
}

function formatCategoryLabel(option: CategoryOption): string {
  if (option.depth === 0) {
    return option.name;
  }

  if (option.depth === 1) {
    return `\u3000${option.name}`;
  }

  return `\u3000(${option.depth}) ${option.name}`;
}

export function CategoryTreeSelect({
  categories,
  value,
  disabled,
  onChange,
}: CategoryTreeSelectProps) {
  const options = flattenCategoryTree(categories);

  return (
    <select
      id="categoryId"
      name="categoryId"
      value={value ?? ""}
      onChange={(event) =>
        onChange(event.target.value ? Number(event.target.value) : null)
      }
      disabled={disabled}
      aria-label="카테고리"
      className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">
        {disabled ? "카테고리 불러오는 중..." : "카테고리 선택"}
      </option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {formatCategoryLabel(option)}
        </option>
      ))}
    </select>
  );
}
