"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { buildDropZoneId } from "../lib/tree-utils";
import type {
  ChangeMarker,
  CategoryTreeMode,
  DropTarget,
} from "../lib/tree-utils";
import type { Category } from "@entities/category";
import { cn } from "@shared/lib/style-utils";

interface CategoryTreeRowProps {
  category: Category;
  depth: number;
  mode: CategoryTreeMode;
  hasVisibleChildren: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  showSlug: boolean;
  changeMarker?: ChangeMarker;
  dropTarget: DropTarget | null;
  onToggle: (id: number) => void;
  onSelectToggle: (id: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTreeRow({
  category,
  depth,
  mode,
  hasVisibleChildren,
  isExpanded,
  isSelected,
  showSlug,
  changeMarker,
  dropTarget,
  onToggle,
  onSelectToggle,
  onEdit,
  onDelete,
}: CategoryTreeRowProps) {
  const draggable = useDraggable({
    id: `category-drag:${category.id}`,
    data: {
      categoryId: category.id,
    },
    disabled: mode !== "edit",
  });
  const beforeDrop = useDroppable({
    id: buildDropZoneId(category.id, "before"),
    disabled: mode !== "edit",
  });
  const insideDrop = useDroppable({
    id: buildDropZoneId(category.id, "inside"),
    disabled: mode !== "edit",
  });
  const afterDrop = useDroppable({
    id: buildDropZoneId(category.id, "after"),
    disabled: mode !== "edit",
  });

  const currentDropPosition =
    dropTarget?.targetId === category.id ? dropTarget.position : null;
  const isInvalidDropTarget =
    dropTarget?.targetId === category.id && dropTarget.invalid;
  const isDragging = draggable.isDragging;
  const transformStyle =
    draggable.transform && mode === "edit"
      ? {
          transform: CSS.Translate.toString(draggable.transform),
        }
      : undefined;

  return (
    <li className="relative">
      <div
        ref={beforeDrop.setNodeRef}
        className="flex h-3 items-center"
        aria-hidden="true"
      >
        <DropLine
          active={currentDropPosition === "before" && !isInvalidDropTarget}
        />
      </div>

      <div ref={insideDrop.setNodeRef}>
        <div
          ref={draggable.setNodeRef}
          className={cn(
            "flex items-center gap-2 rounded-[1rem] border border-transparent bg-background-1 px-3 py-3 transition-colors",
            "hover:border-border-3 hover:bg-background-2",
            !category.isVisible && "opacity-50",
            isDragging && "z-10 opacity-50 shadow-lg",
            currentDropPosition === "inside" &&
              !isInvalidDropTarget &&
              "bg-primary-1/10 ring-1 ring-primary-1/30",
            currentDropPosition === "inside" &&
              isInvalidDropTarget &&
              "cursor-not-allowed opacity-30",
          )}
          style={{
            ...transformStyle,
            paddingLeft: `${depth * 24 + 12}px`,
          }}
        >
          <button
            type="button"
            onClick={() => onToggle(category.id)}
            disabled={!hasVisibleChildren}
            aria-label="하위 카테고리 토글"
            aria-expanded={hasVisibleChildren ? isExpanded : undefined}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-text-3 transition-colors",
              hasVisibleChildren
                ? "cursor-pointer hover:bg-background-3 hover:text-text-1"
                : "cursor-default",
            )}
          >
            {hasVisibleChildren ? (isExpanded ? "▼" : "▶") : null}
          </button>

          {mode === "select" ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectToggle(category.id)}
              aria-label={`${category.name} 선택`}
              className="h-4 w-4 shrink-0 accent-primary-1"
            />
          ) : null}

          {mode === "edit" ? (
            <button
              type="button"
              aria-label={`${category.name} 드래그 핸들`}
              className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-[0.65rem] border border-border-3 text-sm text-text-3 active:cursor-grabbing"
              {...draggable.attributes}
              {...draggable.listeners}
            >
              ⠿
            </button>
          ) : null}

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate whitespace-nowrap font-medium leading-none text-text-1">
              {category.name}
            </span>
            {!category.isVisible ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-background-3 px-2 py-0.5 text-[11px] font-medium leading-none text-text-3">
                숨김
              </span>
            ) : null}
            {showSlug ? (
              <span className="shrink-0 whitespace-nowrap rounded-full border border-border-3 bg-background-2 px-2 py-0.5 text-[11px] leading-none text-text-4">
                {category.slug}
              </span>
            ) : null}
            {changeMarker ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-primary-1/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] leading-none text-primary-1">
                {changeMarker}
              </span>
            ) : null}
          </div>

          <span className="shrink-0 whitespace-nowrap rounded-full bg-primary-1/8 px-3 py-1 text-xs font-medium leading-none text-text-3">
            발행 {category.publishedPostCount ?? 0} / 전체{" "}
            {category.totalPostCount ?? 0}
          </span>

          {mode === "view" ? (
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => onDelete(category)}
                className="inline-flex items-center justify-center rounded-[0.75rem] border border-negative-1/30 px-3 py-1.5 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={afterDrop.setNodeRef}
        className="flex h-3 items-center"
        aria-hidden="true"
      >
        <DropLine
          active={currentDropPosition === "after" && !isInvalidDropTarget}
        />
      </div>
    </li>
  );
}

export function CategoryTreeRowPreview({
  category,
  depth,
  changeMarker,
}: {
  category: Category;
  depth: number;
  changeMarker?: ChangeMarker;
}) {
  return (
    <div
      className="flex min-w-[18rem] items-center gap-2 rounded-lg border border-border-3 bg-background-2 px-3 py-2.5 shadow-[0px_18px_40px_0px_rgba(0,0,0,0.14)]"
      style={{ paddingLeft: `${depth * 24 + 12}px` }}
    >
      <div className="h-5 w-5 shrink-0" />
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.65rem] border border-border-3 text-sm text-text-3">
        ⠿
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-medium text-text-1">
          {category.name}
        </span>
        <span className="shrink-0 rounded-full bg-background-3 px-2 py-0.5 text-xs text-text-4">
          {category.slug}
        </span>
        {changeMarker ? (
          <span className="shrink-0 rounded-full bg-primary-1/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-1">
            {changeMarker}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function DropLine({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "h-0.5 w-full rounded-full bg-transparent transition-colors",
        active && "bg-primary-1",
      )}
    />
  );
}
