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
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onBulkVisibilityChange: (ids: number[], isVisible: boolean) => Promise<void>;
  onSaveTree: (changes: CategoryTreeChange[]) => Promise<void>;
  isBulkUpdating: boolean;
  isSavingTree: boolean;
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
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
  const allDisplayedSelected =
    displayedCategoryIds.length > 0 &&
    displayedCategoryIds.every((id) => selectedIds.has(id));

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
    setSelectedIds(new Set());
    setMode("select");
  };

  const handleEnterEditMode = () => {
    setRestoreExpandedIds(new Set(expandedIds));
    setOriginalTree(cloneCategoryTree(workingCategories));
    setExpandedIds(collectExpandableIds(workingCategories, showHidden));
    setSelectedIds(new Set());
    setMode("edit");
  };

  const handleExitSelectMode = () => {
    setSelectedIds(new Set());
    setMode("view");
  };

  const resetEditMode = (restoreOriginalTree: boolean) => {
    if (restoreOriginalTree && originalTree) {
      setWorkingCategories(cloneCategoryTree(originalTree));
    }

    setMode("view");
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
      <div>
        <CategoryTreeToolbar
          mode={mode}
          showHidden={showHidden}
          selectedCount={selectedIds.size}
          pendingChangeCount={pendingChanges.length}
          allDisplayedSelected={allDisplayedSelected}
          isBulkUpdating={isBulkUpdating}
          isSavingTree={isSavingTree}
          onShowHiddenChange={setShowHidden}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onEnterSelectMode={handleEnterSelectMode}
          onEnterEditMode={handleEnterEditMode}
          onToggleSelectAll={handleToggleSelectAll}
          onClearSelection={() => setSelectedIds(new Set())}
          onCompleteSelectMode={handleExitSelectMode}
          onHideSelected={() => void handleApplyVisibility(false)}
          onShowSelected={() => void handleApplyVisibility(true)}
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
                changeMarker={changeMarkerMap.get(category.id)}
                dropTarget={dropTarget}
                onToggle={handleToggle}
                onSelectToggle={handleToggleSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>

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
