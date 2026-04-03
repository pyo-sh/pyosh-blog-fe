"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Icon } from "@iconify/react";
import altArrowRightLinear from "@iconify-icons/solar/alt-arrow-right-linear";
import menuDotsLinear from "@iconify-icons/solar/menu-dots-linear";
import penNewRoundLinear from "@iconify-icons/solar/pen-new-round-linear";
import trashBinMinimalisticLinear from "@iconify-icons/solar/trash-bin-minimalistic-linear";
import { buildRowDropId } from "../lib/tree-utils";
import type {
  ChangeMarker,
  DropPosition,
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
  onToggleVisibility: (category: Category) => void;
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
  onToggleVisibility,
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
  const rowDrop = useDroppable({
    id: buildRowDropId(category.id),
    disabled: mode !== "edit",
    data: {
      categoryId: category.id,
      depth,
      hasVisibleChildren,
    },
  });

  const currentDropPosition =
    dropTarget?.targetId === category.id ? dropTarget.position : null;
  const isInvalidDropTarget =
    dropTarget?.targetId === category.id && dropTarget.invalid;
  const isDragging = draggable.isDragging;

  const rowOpacity = !category.isVisible ? "opacity-50" : undefined;

  return (
    <li
      ref={rowDrop.setNodeRef}
      className={cn(
        "relative border-b border-border-4 transition-colors last:border-b-0",
        isDragging ? "opacity-20" : "cursor-pointer hover:bg-background-3",
      )}
      onClick={() => {
        if (hasVisibleChildren) {
          onToggle(category.id);
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onEdit(category);
      }}
    >
      <div className="flex h-[12px] items-center" aria-hidden="true">
        <DropLine
          active={currentDropPosition === "before" && !isInvalidDropTarget}
          depth={depth}
        />
      </div>

      <div>
        <div
          ref={draggable.setNodeRef}
          className={cn(
            "flex h-[28px] items-center justify-between gap-2 px-4 transition-colors",
            mode === "edit" ? "cursor-grab active:cursor-grabbing" : "",
            currentDropPosition === "inside" &&
              !isInvalidDropTarget &&
              "bg-primary-1/10 ring-1 ring-primary-1/30",
            currentDropPosition === "inside" &&
              isInvalidDropTarget &&
              "cursor-not-allowed opacity-30",
          )}
          {...(mode === "edit" ? draggable.attributes : {})}
          {...(mode === "edit" ? draggable.listeners : {})}
        >
          <div
            className="flex min-w-0 flex-1 items-center gap-2"
            style={{ paddingLeft: `${depth * 24}px`, opacity: rowOpacity }}
          >
            {mode === "select" ? (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectToggle(category.id)}
                onClick={(event) => event.stopPropagation()}
                aria-label={`${category.name} 선택`}
                className="h-4 w-4 shrink-0 cursor-pointer accent-primary-1"
              />
            ) : null}

            {mode === "edit" ? (
              <div
                aria-hidden="true"
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-text-4"
              >
                <Icon icon={menuDotsLinear} width="16" aria-hidden="true" />
              </div>
            ) : null}

            {hasVisibleChildren ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(category.id);
                }}
                aria-label="하위 카테고리 토글"
                aria-expanded={isExpanded}
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-3 transition-all hover:bg-background-3 hover:text-text-2",
                  isExpanded && "text-text-2",
                )}
              >
                <Icon
                  icon={altArrowRightLinear}
                  width="16"
                  aria-hidden="true"
                  className={cn(
                    "transition-transform duration-200",
                    isExpanded && "rotate-90",
                  )}
                />
              </button>
            ) : (
              <div className="h-6 w-6 shrink-0" aria-hidden="true" />
            )}

            <span className="truncate whitespace-nowrap text-sm font-medium leading-none text-text-1">
              {category.name}
            </span>
            {!category.isVisible ? (
              <span className="shrink-0 whitespace-nowrap text-[12px] leading-none text-text-4">
                (숨김)
              </span>
            ) : null}
            {showSlug ? (
              <span className="shrink-0 whitespace-nowrap rounded-[4px] bg-background-3 px-1.5 py-px text-[11px] leading-none text-text-4">
                {category.slug}
              </span>
            ) : null}
            {changeMarker ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-primary-1/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] leading-none text-primary-1">
                {formatChangeMarker(changeMarker)}
              </span>
            ) : null}
          </div>

          <div
            className="flex shrink-0 items-center gap-3"
            style={{ opacity: rowOpacity }}
          >
            <span className="whitespace-nowrap rounded-[4px] bg-[rgba(219,221,224,0.30)] px-1.5 py-px text-[12px] leading-4 text-text-3">
              발행 {category.publishedPostCount ?? 0} / 전체{" "}
              {category.totalPostCount ?? 0}
            </span>

            {mode === "view" ? (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleVisibility(category);
                  }}
                  aria-label={`${category.name} 표시 여부`}
                  className="cursor-pointer"
                >
                  <span
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-[10px] border-2 border-transparent transition-colors duration-200",
                      category.isVisible ? "bg-primary-1" : "bg-border-3",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 rounded-[8px] bg-white shadow-sm transition-transform duration-200",
                        category.isVisible ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(category);
                  }}
                  aria-label={`${category.name} 수정`}
                  className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-text-4 transition-colors hover:bg-background-3 hover:text-text-2"
                >
                  <Icon
                    icon={penNewRoundLinear}
                    width="16"
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(category);
                  }}
                  aria-label={`${category.name} 삭제`}
                  className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-text-4 transition-colors hover:bg-background-3 hover:text-negative-1"
                >
                  <Icon
                    icon={trashBinMinimalisticLinear}
                    width="16"
                    aria-hidden="true"
                  />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex h-[12px] items-center" aria-hidden="true">
        <DropLine
          active={currentDropPosition === "after" && !isInvalidDropTarget}
          depth={depth}
        />
      </div>
    </li>
  );
}

export function CategoryTreeRowPreview({
  category,
  depth,
  changeMarker,
  dropPosition,
  invalidDrop,
}: {
  category: Category;
  depth: number;
  changeMarker?: ChangeMarker;
  dropPosition: DropPosition | null;
  invalidDrop: boolean;
}) {
  return (
    <div className="flex min-w-[18rem] items-center justify-between gap-2 rounded-xl border border-border-3 bg-background-2 px-4 py-3 shadow-[0px_18px_40px_0px_rgba(0,0,0,0.14)]">
      <div
        className="flex min-w-0 flex-1 items-center gap-2"
        style={{ paddingLeft: `${depth * 24}px` }}
      >
        <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-text-4">
          <Icon icon={menuDotsLinear} width="16" aria-hidden="true" />
        </div>
        <div className="h-6 w-6 shrink-0" />
        <span className="truncate whitespace-nowrap text-sm font-medium leading-none text-text-1">
          {category.name}
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-[4px] bg-background-3 px-1.5 py-px text-[11px] leading-none text-text-4">
          {category.slug}
        </span>
        {changeMarker ? (
          <span className="shrink-0 rounded-full bg-primary-1/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] leading-none text-primary-1">
            {formatChangeMarker(changeMarker)}
          </span>
        ) : null}
      </div>
      <span className="whitespace-nowrap rounded-[4px] bg-[rgba(219,221,224,0.30)] px-1.5 py-px text-[12px] leading-4 text-text-3">
        발행 {category.publishedPostCount ?? 0} / 전체{" "}
        {category.totalPostCount ?? 0}
      </span>
      <span
        className={cn(
          "whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium leading-none",
          invalidDrop
            ? "bg-negative-1/10 text-negative-1"
            : dropPosition === "inside"
              ? "bg-primary-1/10 text-primary-1"
              : "bg-background-3 text-text-3",
        )}
      >
        {invalidDrop
          ? "이동 불가"
          : dropPosition === "inside"
            ? "자식으로 이동"
            : "순서 변경"}
      </span>
    </div>
  );
}

function DropLine({ active, depth }: { active: boolean; depth: number }) {
  return (
    <div
      style={{ marginLeft: `${depth * 24 + 16}px` }}
      className={cn(
        "h-0.5 w-full rounded-full bg-transparent transition-colors",
        active && "bg-primary-1",
      )}
    />
  );
}

function formatChangeMarker(marker: ChangeMarker) {
  if (marker === "moved") {
    return "바뀜";
  }

  if (marker === "new-parent") {
    return "부모 변경";
  }

  return marker;
}
