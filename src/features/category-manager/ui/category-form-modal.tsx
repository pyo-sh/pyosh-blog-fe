"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Category,
  CreateCategoryBody,
  UpdateCategoryBody,
} from "@entities/category";
import { useImeSafeText } from "@shared/hooks/use-ime-safe-text";
import { DropSelect, Modal, Spinner } from "@shared/ui/libs";
import { ToggleSwitch } from "@shared/ui/toggle-switch";

interface CategoryFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  category: Category | null;
  parentOptions: CategoryOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  parentId: number | null;
  isVisible: boolean;
}

export interface CategoryOption {
  id: number;
  label: string;
}

function getInitialValues(category: Category | null): CategoryFormValues {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    parentId: category?.parentId ?? null,
    isVisible: category?.isVisible ?? true,
  };
}

export function CategoryFormModal({
  isOpen,
  mode,
  category,
  parentOptions,
  isSubmitting,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [values, setValues] = useState<CategoryFormValues>(() =>
    getInitialValues(category),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const {
    handleChange: handleNameChange,
    handleCompositionStart: handleNameCompositionStart,
    handleCompositionEnd: handleNameCompositionEnd,
    resetComposition: resetNameComposition,
  } = useImeSafeText<HTMLInputElement>({
    onCommit: (name) =>
      setValues((current) => ({
        ...current,
        name,
      })),
    transform: (value) => value.normalize("NFC"),
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(getInitialValues(category));
    resetNameComposition();
    setValidationError(null);
  }, [category, isOpen, resetNameComposition]);

  const title = mode === "create" ? "카테고리 추가" : "카테고리 수정";
  const submitLabel = mode === "create" ? "추가" : "저장";
  const submittingLabel = mode === "create" ? "추가 중" : "저장 중";
  const trimmedName = values.name.normalize("NFC").trim();
  const handleModalClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = () => {
    if (!trimmedName) {
      setValidationError("카테고리 이름을 입력하세요.");

      return;
    }

    setValidationError(null);
    onSubmit({
      name: trimmedName,
      slug: values.slug.trim(),
      parentId: values.parentId,
      isVisible: values.isVisible,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      withBackground
      aria-label={title}
      className="w-[min(100%,40rem)] p-0 text-left"
    >
      <div className="border-b border-border-3 px-6 py-5">
        <h2 className="text-xl font-semibold text-text-1">{title}</h2>
      </div>

      <div className="space-y-5 px-6 py-5">
        <label className="flex flex-col gap-2 text-sm text-text-2">
          <span className="font-medium text-text-1">이름</span>
          <input
            type="text"
            value={values.name}
            onChange={handleNameChange}
            onCompositionStart={handleNameCompositionStart}
            onCompositionEnd={handleNameCompositionEnd}
            placeholder="카테고리 이름"
            maxLength={50}
            disabled={isSubmitting}
            aria-label="카테고리 이름"
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-text-2">
          <span className="font-medium text-text-1">부모 카테고리</span>
          <DropSelect
            value={values.parentId === null ? "" : String(values.parentId)}
            options={[
              { label: "최상위 카테고리", value: "" },
              ...parentOptions.map((option) => ({
                label: option.label,
                value: String(option.id),
              })),
            ]}
            onChange={(nextValue) =>
              setValues((current) => ({
                ...current,
                parentId: nextValue ? Number(nextValue) : null,
              }))
            }
            disabled={isSubmitting}
            ariaLabel="부모 카테고리"
            className="w-full"
            triggerClassName="h-10 rounded-[0.75rem] text-[13px] text-text-2"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-text-2">
          <span className="font-medium text-text-1">Slug</span>
          <input
            type="text"
            value={values.slug}
            onChange={(event) =>
              setValues((current) => ({ ...current, slug: event.target.value }))
            }
            placeholder={mode === "create" ? "생성 시 자동 생성됩니다" : ""}
            maxLength={100}
            disabled
            aria-label="카테고리 슬러그"
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-4 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-100"
          />
          <p className="text-[11px] text-text-4">
            현재 API는 slug 직접 생성·수정을 지원하지 않아 저장에는 반영되지
            않습니다.
          </p>
        </label>

        <div className="flex items-center justify-between rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-2">
          <span className="font-medium text-text-1">목록에 표시</span>
          <ToggleSwitch
            checked={values.isVisible}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                isVisible: checked,
              }))
            }
            aria-label="목록에 표시"
            disabled={isSubmitting}
          />
        </div>

        {validationError ? (
          <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/10 px-4 py-3 text-sm text-negative-1">
            {validationError}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-border-3 px-6 py-5">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-[0.75rem] border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !trimmedName}
          className="inline-flex items-center justify-center rounded-[0.75rem] bg-primary-1 px-4 py-2 text-sm font-medium text-text-1 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" /> {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </Modal>
  );
}

export function toCreateCategoryBody(
  values: CategoryFormValues,
): CreateCategoryBody {
  return {
    name: values.name,
    parentId: values.parentId,
    isVisible: values.isVisible,
  };
}

export function toUpdateCategoryBody(
  values: CategoryFormValues,
): UpdateCategoryBody {
  return {
    name: values.name,
    parentId: values.parentId,
    isVisible: values.isVisible,
  };
}
