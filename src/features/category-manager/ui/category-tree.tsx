"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CategoryTreeRow, CategoryTreeRowPreview } from "./category-tree-row";
import { CategoryTreeToolbar } from "./category-tree-toolbar";
import {
  calculateTreeChanges,
  cloneCategoryTree,
  collectExpandableIds,
  flattenCategoryTree,
  getChangeMarkerMap,
  getDisplayedCategoryIds,
  isDropBlocked,
  moveCategory,
  parseDropZoneId,
  type CategoryTreeMode,
  type DropTarget,
} from "../lib/tree-utils";
import type { Category, CategoryTreeChange } from "@entities/category";
import { ConfirmDialog } from "@shared/ui/confirm-dialog";
import { EmptyState } from "@shared/ui/libs";

interface CategoryTreeProps {
  categories: Category[];
  totalCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleVisibility: (category: Category) => Promise<void>;
  onCreate: () => void;
  onBulkVisibilityChange: (ids: number[], isVisible: boolean) => Promise<void>;
  onSaveTree: (changes: CategoryTreeChange[]) => Promise<void>;
  isBulkUpdating: boolean;
  isSavingTree: boolean;
}

export function CategoryTree({
  categories,
  totalCount,
  onEdit,
  onDelete,
  onToggleVisibility,
  onCreate,
  onBulkVisibilityChange,
  onSaveTree,
  isBulkUpdating,
  isSavingTree,
}: CategoryTreeProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor),
  );
  const [mode, setMode] = useState<CategoryTreeMode>("view");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [showSlug, setShowSlug] = useState(true);
  const [restoreShowHidden, setRestoreShowHidden] = useState(false);
  const [workingCategories, setWorkingCategories] = useState<Category[]>(
    cloneCategoryTree(categories),
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [originalTree, setOriginalTree] = useState<Category[] | null>(null);
  const [restoreExpandedIds, setRestoreExpandedIds] = useState<Set<number>>(
    new Set(),
  );
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (mode !== "edit") {
      setWorkingCategories(cloneCategoryTree(categories));
    }
  }, [categories, mode]);

  const visibleRows = useMemo(
    () => flattenCategoryTree(workingCategories, expandedIds, showHidden),
    [expandedIds, showHidden, workingCategories],
  );
  const displayedCategoryIds = useMemo(
    () => getDisplayedCategoryIds(workingCategories, expandedIds, showHidden),
    [expandedIds, showHidden, workingCategories],
  );
  const pendingChanges = useMemo(
    () =>
      originalTree
        ? calculateTreeChanges(originalTree, workingCategories)
        : ([] as CategoryTreeChange[]),
    [originalTree, workingCategories],
  );
  const changeMarkerMap = useMemo(
    () =>
      originalTree
        ? getChangeMarkerMap(originalTree, workingCategories)
        : new Map<number, "moved" | "new-parent">(),
    [originalTree, workingCategories],
  );
  const activeRow = activeDragId
    ? visibleRows.find(({ category }) => category.id === activeDragId)
    : null;
  const selectedCount = selectedIds.size;

  const handleToggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedIds(collectExpandableIds(workingCategories, showHidden));
  }, [showHidden, workingCategories]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleEnterSelectMode = () => {
    setRestoreShowHidden(showHidden);
    setShowHidden(true);
    setSelectedIds(new Set());
    setMode("select");
  };

  const handleEnterEditMode = () => {
    setRestoreExpandedIds(new Set(expandedIds));
    setRestoreShowHidden(showHidden);
    setShowHidden(true);
    setOriginalTree(cloneCategoryTree(workingCategories));
    setExpandedIds(collectExpandableIds(workingCategories, true));
    setSelectedIds(new Set());
    setMode("edit");
  };

  const handleExitSelectMode = () => {
    setShowHidden(restoreShowHidden);
    setSelectedIds(new Set());
    setMode("view");
  };

  const resetEditMode = (restoreOriginalTree: boolean) => {
    if (restoreOriginalTree && originalTree) {
      setWorkingCategories(cloneCategoryTree(originalTree));
    }

    setMode("view");
    setShowHidden(restoreShowHidden);
    setExpandedIds(new Set(restoreExpandedIds));
    setOriginalTree(null);
    setActiveDragId(null);
    setDropTarget(null);
    setIsCancelDialogOpen(false);
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (displayedCategoryIds.every((id) => next.has(id))) {
        displayedCategoryIds.forEach((id) => next.delete(id));
      } else {
        displayedCategoryIds.forEach((id) => next.add(id));
      }

      return next;
    });
  };

  const handleApplyVisibility = async (isVisible: boolean) => {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) {
      return;
    }

    await onBulkVisibilityChange(ids, isVisible);
    setSelectedIds(new Set());
  };

  const handleSaveEditMode = async () => {
    if (pendingChanges.length === 0) {
      resetEditMode(false);

      return;
    }

    await onSaveTree(pendingChanges);
    resetEditMode(false);
  };

  const handleCancelEditMode = () => {
    if (pendingChanges.length === 0) {
      resetEditMode(true);

      return;
    }

    setIsCancelDialogOpen(true);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const nextId = Number(active.data.current?.categoryId);

    if (!Number.isFinite(nextId)) {
      return;
    }

    setActiveDragId(nextId);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    if (!over || activeDragId === null) {
      setDropTarget(null);

      return;
    }

    const parsedTarget = parseDropZoneId(String(over.id));

    if (!parsedTarget) {
      setDropTarget(null);

      return;
    }

    setDropTarget({
      ...parsedTarget,
      invalid: isDropBlocked(
        workingCategories,
        activeDragId,
        parsedTarget.targetId,
      ),
    });
  };

  const handleDragEnd = () => {
    if (activeDragId !== null && dropTarget && !dropTarget.invalid) {
      setWorkingCategories((prev) =>
        moveCategory(prev, activeDragId, {
          targetId: dropTarget.targetId,
          position: dropTarget.position,
        }),
      );
    }

    setActiveDragId(null);
    setDropTarget(null);
  };

  if (categories.length === 0) {
    return (
      <EmptyState message="카테고리가 없습니다. 새 카테고리를 생성하세요." />
    );
  }

  return (
    <>
      <div className={mode === "select" ? "pb-24" : ""}>
        <CategoryTreeToolbar
          totalCount={totalCount}
          mode={mode}
          showHidden={showHidden}
          showSlug={showSlug}
          pendingChangeCount={pendingChanges.length}
          isSavingTree={isSavingTree}
          onShowHiddenChange={setShowHidden}
          onShowSlugChange={setShowSlug}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onCreate={onCreate}
          onEnterSelectMode={handleEnterSelectMode}
          onEnterEditMode={handleEnterEditMode}
          onCancelEditMode={handleCancelEditMode}
          onSaveEditMode={() => void handleSaveEditMode()}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActiveDragId(null);
            setDropTarget(null);
          }}
        >
          <div className="overflow-hidden rounded-xl border border-border-4 bg-background-2">
            <ul>
              {visibleRows.map(({ category, depth, hasVisibleChildren }) => (
                <CategoryTreeRow
                  key={category.id}
                  category={category}
                  depth={depth}
                  mode={mode}
                  hasVisibleChildren={hasVisibleChildren}
                  isExpanded={expandedIds.has(category.id)}
                  isSelected={selectedIds.has(category.id)}
                  showSlug={showSlug}
                  changeMarker={changeMarkerMap.get(category.id)}
                  dropTarget={dropTarget}
                  onToggle={handleToggle}
                  onToggleVisibility={(nextCategory) =>
                    void onToggleVisibility(nextCategory)
                  }
                  onSelectToggle={handleToggleSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </div>

          <DragOverlay>
            {activeRow ? (
              <CategoryTreeRowPreview
                category={activeRow.category}
                depth={activeRow.depth}
                changeMarker={changeMarkerMap.get(activeRow.category.id)}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        {mode === "select" ? (
          <div className="fixed bottom-0 left-0 right-0 z-20 md:left-60">
            <div className="flex flex-wrap items-center gap-3 border-t border-border-3 bg-[rgba(241,242,243,0.95)] px-4 py-3 backdrop-blur-[12px] md:px-6 dark:bg-[rgba(19,20,21,0.94)]">
              <span className="text-sm font-medium text-text-1">
                선택됨 {selectedCount}개
              </span>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="cursor-pointer px-2 py-1.5 text-sm text-primary-1 transition-colors hover:text-primary-1/80"
                >
                  전체 선택
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="cursor-pointer px-2 py-1.5 text-sm text-text-3 transition-colors hover:text-text-1"
                >
                  전체 해제
                </button>
                <button
                  type="button"
                  onClick={() => void handleApplyVisibility(false)}
                  disabled={selectedCount === 0 || isBulkUpdating}
                  className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  숨기기
                </button>
                <button
                  type="button"
                  onClick={() => void handleApplyVisibility(true)}
                  disabled={selectedCount === 0 || isBulkUpdating}
                  className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] border border-border-3 px-3 text-sm text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  보이기
                </button>
                <button
                  type="button"
                  onClick={handleExitSelectMode}
                  className="inline-flex h-9 cursor-pointer items-center rounded-[0.7rem] bg-primary-1 px-3 text-sm text-white transition-opacity hover:opacity-90"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={() => resetEditMode(true)}
        title="변경사항을 취소하시겠습니까?"
        confirmLabel="변경 취소"
      >
        저장하지 않은 배치 편집 변경사항이 사라집니다.
      </ConfirmDialog>
    </>
  );
}
