"use client";

import type { Category } from "@entities/category";
import { DropSelect } from "@shared/ui/libs";

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
    <DropSelect
      id="categoryId"
      name="categoryId"
      value={value === null ? "" : String(value)}
      onChange={(nextValue) => onChange(nextValue ? Number(nextValue) : null)}
      disabled={disabled}
      ariaLabel="카테고리"
      className="w-full"
      triggerClassName="h-10 rounded-[0.75rem] text-[13px] text-text-2"
      options={[
        {
          label: disabled ? "카테고리 불러오는 중..." : "카테고리 선택",
          value: "",
        },
        ...options.map((option) => ({
          label: formatCategoryLabel(option),
          value: String(option.id),
        })),
      ]}
    />
  );
}
