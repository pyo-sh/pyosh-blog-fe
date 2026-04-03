"use client";

import { Icon } from "@iconify/react";
import addFolderLinear from "@iconify-icons/solar/add-folder-linear";
import altArrowDownLinear from "@iconify-icons/solar/alt-arrow-down-linear";
import altArrowUpLinear from "@iconify-icons/solar/alt-arrow-up-linear";
import checkReadLinear from "@iconify-icons/solar/check-read-linear";
import checkSquareLinear from "@iconify-icons/solar/check-square-linear";
import sortVerticalLinear from "@iconify-icons/solar/sort-vertical-linear";
import type { CategoryTreeMode } from "../lib/tree-utils";
import { ToggleSwitch } from "@shared/ui/toggle-switch";

interface CategoryTreeToolbarProps {
  totalCount: number;
  mode: CategoryTreeMode;
  showHidden: boolean;
  showSlug: boolean;
  pendingChangeCount: number;
  isSavingTree: boolean;
  onShowHiddenChange: (nextValue: boolean) => void;
  onShowSlugChange: (nextValue: boolean) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onCreate: () => void;
  onEnterSelectMode: () => void;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSaveEditMode: () => void;
}

export function CategoryTreeToolbar({
  totalCount,
  mode,
  showHidden,
  showSlug,
  pendingChangeCount,
  isSavingTree,
  onShowHiddenChange,
  onShowSlugChange,
  onExpandAll,
  onCollapseAll,
  onCreate,
  onEnterSelectMode,
  onEnterEditMode,
  onCancelEditMode,
  onSaveEditMode,
}: CategoryTreeToolbarProps) {
  if (mode === "select") {
    return null;
  }

  if (mode === "edit") {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center whitespace-nowrap rounded-md bg-primary-1/12 px-2.5 py-1 text-[13px] font-medium leading-none text-primary-1">
            변경사항: {pendingChangeCount}건
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCancelEditMode}
            disabled={isSavingTree}
            className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border-3 px-4 text-sm font-normal leading-none text-text-2 transition-colors hover:bg-background-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSaveEditMode}
            disabled={pendingChangeCount === 0 || isSavingTree}
            className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-1 px-4 text-sm font-normal leading-none text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon icon={checkReadLinear} width="18" aria-hidden="true" />
            {isSavingTree ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="whitespace-nowrap text-sm font-medium leading-none text-text-2">
          전체 <strong className="text-text-1">{totalCount}개</strong> 카테고리
        </span>
        <div className="flex flex-wrap items-center gap-1 border-l border-border-4 pl-3">
          <button
            type="button"
            onClick={onExpandAll}
            className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border-3 px-3 text-sm font-normal leading-none text-text-2 transition-colors hover:bg-background-3"
          >
            <Icon icon={altArrowDownLinear} width="16" aria-hidden="true" />
            전체 펼침
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border-3 px-3 text-sm font-normal leading-none text-text-2 transition-colors hover:bg-background-3"
          >
            <Icon icon={altArrowUpLinear} width="16" aria-hidden="true" />
            전체 접힘
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-l border-border-4 pl-3">
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
            <span className="text-[13px] leading-none text-text-3">
              숨김 표시
            </span>
            <ToggleSwitch
              checked={showHidden}
              onChange={onShowHiddenChange}
              size="sm"
              aria-label="숨김 카테고리 표시"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
            <span className="text-[13px] leading-none text-text-3">
              slug 표시
            </span>
            <ToggleSwitch
              checked={showSlug}
              onChange={onShowSlugChange}
              size="sm"
              aria-label="slug 표시"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onEnterSelectMode}
          className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border-3 px-4 text-sm font-normal leading-none text-text-2 transition-colors hover:bg-background-3"
        >
          <Icon icon={checkSquareLinear} width="18" aria-hidden="true" />
          일괄 선택
        </button>
        <button
          type="button"
          onClick={onEnterEditMode}
          className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border-3 px-4 text-sm font-normal leading-none text-text-2 transition-colors hover:bg-background-3"
        >
          <Icon icon={sortVerticalLinear} width="18" aria-hidden="true" />
          배치 편집
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-1 px-4 text-sm font-normal leading-none text-white transition-opacity hover:opacity-90"
        >
          <Icon icon={addFolderLinear} width="18" aria-hidden="true" />
          카테고리 추가
        </button>
      </div>
    </div>
  );
}
