"use client";

import type { CategoryTreeMode } from "../lib/tree-utils";
import { ToggleSwitch } from "@shared/ui/toggle-switch";

interface CategoryTreeToolbarProps {
  mode: CategoryTreeMode;
  showHidden: boolean;
  selectedCount: number;
  pendingChangeCount: number;
  allDisplayedSelected: boolean;
  isBulkUpdating: boolean;
  isSavingTree: boolean;
  onShowHiddenChange: (nextValue: boolean) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onEnterSelectMode: () => void;
  onEnterEditMode: () => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onCompleteSelectMode: () => void;
  onHideSelected: () => void;
  onShowSelected: () => void;
  onCancelEditMode: () => void;
  onSaveEditMode: () => void;
}

export function CategoryTreeToolbar({
  mode,
  showHidden,
  selectedCount,
  pendingChangeCount,
  allDisplayedSelected,
  isBulkUpdating,
  isSavingTree,
  onShowHiddenChange,
  onExpandAll,
  onCollapseAll,
  onEnterSelectMode,
  onEnterEditMode,
  onToggleSelectAll,
  onClearSelection,
  onCompleteSelectMode,
  onHideSelected,
  onShowSelected,
  onCancelEditMode,
  onSaveEditMode,
}: CategoryTreeToolbarProps) {
  if (mode === "select") {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
        >
          {allDisplayedSelected ? "전체 해제" : "전체 선택"}
        </button>
        <button
          type="button"
          onClick={onHideSelected}
          disabled={selectedCount === 0 || isBulkUpdating}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          숨기기
        </button>
        <button
          type="button"
          onClick={onShowSelected}
          disabled={selectedCount === 0 || isBulkUpdating}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          보이기
        </button>
        <span className="text-sm text-text-4">{selectedCount}개 선택됨</span>
        <button
          type="button"
          onClick={onClearSelection}
          disabled={selectedCount === 0}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          선택 해제
        </button>
        <button
          type="button"
          onClick={onCompleteSelectMode}
          className="inline-flex items-center justify-center rounded-[0.75rem] bg-primary-1 px-3 py-1.5 text-sm font-semibold text-text-1 transition-opacity hover:opacity-90"
        >
          완료
        </button>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-background-3 px-3 py-1.5 text-sm font-medium text-text-2">
          변경사항: {pendingChangeCount}건
        </span>
        <button
          type="button"
          onClick={onCancelEditMode}
          disabled={isSavingTree}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSaveEditMode}
          disabled={pendingChangeCount === 0 || isSavingTree}
          className="inline-flex items-center justify-center rounded-[0.75rem] bg-primary-1 px-3 py-1.5 text-sm font-semibold text-text-1 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSavingTree ? "저장 중..." : "저장"}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExpandAll}
        className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
      >
        전체 펼침
      </button>
      <button
        type="button"
        onClick={onCollapseAll}
        className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
      >
        전체 접힘
      </button>
      <label className="flex cursor-pointer items-center gap-2">
        <ToggleSwitch
          checked={showHidden}
          onChange={onShowHiddenChange}
          aria-label="숨김 카테고리 표시"
        />
        <span className="text-sm text-text-3">
          숨김 표시 {showHidden ? "on" : "off"}
        </span>
      </label>
      <button
        type="button"
        onClick={onEnterSelectMode}
        className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-3 py-1.5 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
      >
        일괄 선택
      </button>
      <button
        type="button"
        onClick={onEnterEditMode}
        className="inline-flex items-center justify-center rounded-[0.75rem] bg-primary-1 px-3 py-1.5 text-sm font-semibold text-text-1 transition-opacity hover:opacity-90"
      >
        배치 편집
      </button>
    </div>
  );
}
