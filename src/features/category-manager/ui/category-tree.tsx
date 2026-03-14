import type { ReactNode } from "react";
import type { Category } from "@entities/category";
import { cn } from "@shared/lib/style-utils";

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function CategoryBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-background-3 text-text-3",
        tone === "warning" && "bg-negative-1/10 text-negative-1",
      )}
    >
      {children}
    </span>
  );
}

function TreeActionButton({
  children,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-[0.75rem] border px-3 py-2 text-sm font-medium transition-colors",
        tone === "default" &&
          "border-border-3 text-text-2 hover:border-border-2 hover:text-text-1",
        tone === "danger" &&
          "border-negative-1/30 text-negative-1 hover:bg-negative-1/10",
      )}
    >
      {children}
    </button>
  );
}

function TreeRow({
  category,
  depth,
  onEdit,
  onDelete,
}: {
  category: Category;
  depth: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const hasChildren = Boolean(
    category.children && category.children.length > 0,
  );

  return (
    <li className="space-y-3">
      <div className="rounded-[1.25rem] border border-border-3 bg-background-1 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-body-xs uppercase tracking-[0.18em] text-text-4">
              <span>{depth === 0 ? "Root" : `Depth ${depth}`}</span>
              {category.isVisible ? null : (
                <CategoryBadge tone="warning">숨김</CategoryBadge>
              )}
              {hasChildren ? (
                <CategoryBadge>
                  {category.children?.length}개 하위 카테고리
                </CategoryBadge>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h3 className="text-body-lg font-semibold text-text-1">
                {category.name}
              </h3>
              <span className="rounded-full border border-border-3 px-3 py-1 text-body-xs text-text-4">
                /{category.slug}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <TreeActionButton onClick={() => onEdit(category)}>
              수정
            </TreeActionButton>
            <TreeActionButton onClick={() => onDelete(category)} tone="danger">
              삭제
            </TreeActionButton>
          </div>
        </div>
      </div>

      {hasChildren ? (
        <ul className="space-y-3 border-l border-border-3 pl-4 md:pl-6">
          {category.children?.map((child) => (
            <TreeRow
              key={child.id}
              category={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border-3 bg-background-1 px-6 py-12 text-center">
        <p className="text-sm text-text-3">등록된 카테고리가 없습니다.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {categories.map((category) => (
        <TreeRow
          key={category.id}
          category={category}
          depth={0}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
