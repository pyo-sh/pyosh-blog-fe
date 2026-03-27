"use client";

import { useEffect, useState } from "react";
import type {
  Category,
  CreateCategoryBody,
  UpdateCategoryBody,
} from "@entities/category";
import { Modal } from "@shared/ui/libs";

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(getInitialValues(category));
    setValidationError(null);
  }, [category, isOpen]);

  const title = mode === "create" ? "카테고리 추가" : "카테고리 수정";
  const submitLabel = isSubmitting
    ? mode === "create"
      ? "추가 중..."
      : "저장 중..."
    : mode === "create"
      ? "추가"
      : "저장";

  const handleSubmit = () => {
    if (!values.name.trim()) {
      setValidationError("카테고리 이름을 입력하세요.");

      return;
    }

    setValidationError(null);
    onSubmit({
      name: values.name.trim(),
      parentId: values.parentId,
      isVisible: values.isVisible,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      withBackground
      className="w-[min(100%,40rem)] p-0 text-left"
    >
      <div className="border-b border-border-3 px-6 py-5">
        <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
          Category form
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-1">{title}</h2>
      </div>

      <div className="space-y-5 px-6 py-5">
        <label className="flex flex-col gap-2 text-sm text-text-2">
          <span className="font-medium text-text-1">이름</span>
          <input
            type="text"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="카테고리 이름"
            disabled={isSubmitting}
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-text-2">
          <span className="font-medium text-text-1">부모 카테고리</span>
          <select
            value={values.parentId ?? ""}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                parentId: event.target.value
                  ? Number(event.target.value)
                  : null,
              }))
            }
            disabled={isSubmitting}
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">최상위 카테고리</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-2">
          <input
            type="checkbox"
            checked={values.isVisible}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                isVisible: event.target.checked,
              }))
            }
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-border-3"
          />
          화면에 표시
        </label>

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
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-[0.75rem] bg-primary-1 px-4 py-2 text-sm font-medium text-text-1 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
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
