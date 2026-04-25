"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type {
  Category,
  CreateCategoryBody,
  UpdateCategoryBody,
} from "@entities/category";
import { useImeSafeText } from "@shared/hooks/use-ime-safe-text";
import { cn } from "@shared/lib/style-utils";
import { Modal, Spinner } from "@shared/ui/libs";
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

function InlineCustomSelect({
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: {
  value: number | null;
  options: CategoryOption[];
  onChange: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxIdRef = useRef(
    `inline-select-${Math.random().toString(36).slice(2)}`,
  );
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const normalizedOptions = [{ id: -1, label: placeholder ?? "" }, ...options];
  const selectedIndex = normalizedOptions.findIndex((option) =>
    option.id === -1 ? value === null : option.id === value,
  );
  const selected = selectedIndex >= 0 ? normalizedOptions[selectedIndex] : null;

  useEffect(() => {
    optionRefs.current = [];
  }, [options]);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);

      return;
    }

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return;
    }

    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  const commitSelection = (index: number) => {
    const option = normalizedOptions[index];
    if (!option) {
      return;
    }

    onChange(option.id === -1 ? null : option.id);
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);

      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((current) => !current);
    }
  };

  const handleOptionKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index + 1) % normalizedOptions.length);

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index - 1 + normalizedOptions.length) % normalizedOptions.length,
      );

      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);

      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(normalizedOptions.length - 1);

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);

      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commitSelection(index);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        role="combobox"
        aria-autocomplete="none"
        aria-expanded={isOpen}
        aria-controls={listboxIdRef.current}
        aria-haspopup="listbox"
        className="flex h-10 w-full items-center rounded-[0.75rem] border border-border-3 bg-background-1 px-3 pr-8 text-left text-[13px] text-text-2 outline-none transition-colors focus-visible:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="truncate">{selected?.label ?? placeholder ?? ""}</span>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-4">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          id={listboxIdRef.current}
          role="listbox"
          aria-activedescendant={
            activeIndex >= 0
              ? `${listboxIdRef.current}-option-${activeIndex}`
              : undefined
          }
          className="absolute left-0 top-[calc(100%+0.25rem)] z-30 min-w-full overflow-hidden rounded-[0.5rem] border border-border-3 bg-background-1 shadow-[0px_8px_24px_rgba(15,23,42,0.08)]"
        >
          {normalizedOptions.map((option, index) => {
            const isSelected =
              option.id === -1 ? value === null : option.id === value;

            return (
              <button
                key={`${option.id}-${option.label}`}
                id={`${listboxIdRef.current}-option-${index}`}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={activeIndex === index ? 0 : -1}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => commitSelection(index)}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-[13px] transition-colors hover:bg-background-2",
                  isSelected ? "font-medium text-primary-1" : "text-text-2",
                )}
              >
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
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
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
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
          <InlineCustomSelect
            value={values.parentId}
            options={parentOptions}
            onChange={(nextValue) =>
              setValues((current) => ({
                ...current,
                parentId: nextValue,
              }))
            }
            placeholder="최상위 카테고리"
            disabled={isSubmitting}
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
