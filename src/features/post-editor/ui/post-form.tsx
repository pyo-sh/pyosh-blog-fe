"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MarkdownEditor } from "./markdown-editor";
import { MarkdownPreview } from "./markdown-preview";
import { fetchCategoriesClient, type Category } from "@entities/category";
import {
  createPost,
  updatePost,
  type CreatePostBody,
  type Post,
} from "@entities/post";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";

export interface PostFormValues {
  title: string;
  categoryId: number | null;
  tags: string;
  status: Post["status"];
  visibility: Post["visibility"];
  thumbnailUrl: string;
  contentMd: string;
}

interface PostFormProps {
  mode?: "create" | "edit";
  postId?: number;
  initialValues?: Partial<PostFormValues>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onSuccess?: (post: Post) => void;
}

const DEFAULT_VALUES: PostFormValues = {
  title: "",
  categoryId: null,
  tags: "",
  status: "draft",
  visibility: "public",
  thumbnailUrl: "",
  contentMd: "",
};

const STATUS_OPTIONS: Array<{ label: string; value: Post["status"] }> = [
  { label: "초안", value: "draft" },
  { label: "발행", value: "published" },
  { label: "보관", value: "archived" },
];

const VISIBILITY_OPTIONS: Array<{
  label: string;
  value: Post["visibility"];
}> = [
  { label: "공개", value: "public" },
  { label: "비공개", value: "private" },
];

function createInitialValues(
  initialValues?: Partial<PostFormValues>,
): PostFormValues {
  return {
    ...DEFAULT_VALUES,
    ...initialValues,
  };
}

function parseTags(value: string): string[] | undefined {
  const tags = Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );

  return tags.length > 0 ? tags : undefined;
}

function buildPayload(values: PostFormValues): CreatePostBody {
  return {
    title: values.title.trim(),
    categoryId: values.categoryId ?? 0,
    contentMd: values.contentMd,
    thumbnailUrl: values.thumbnailUrl.trim() || null,
    status: values.status,
    visibility: values.visibility,
    tags: parseTags(values.tags),
  };
}

function getSubmitLabel(mode: "create" | "edit", submitLabel?: string): string {
  if (submitLabel) {
    return submitLabel;
  }

  return mode === "edit" ? "글 수정" : "글 작성";
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      className="flex flex-col gap-2 text-sm text-text-2"
      htmlFor={htmlFor}
    >
      <span className="font-medium text-text-1">{label}</span>
      {children}
    </label>
  );
}

function getCategoryOptions(categories: Category[]): Category[] {
  return [...categories].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
}

export function PostForm({
  mode = "create",
  postId,
  initialValues,
  submitLabel,
  cancelLabel = "취소",
  onCancel,
  onSuccess,
}: PostFormProps) {
  const queryClient = useQueryClient();
  const nextInitialValues = useMemo(
    () => createInitialValues(initialValues),
    [initialValues],
  );
  const nextInitialSignature = useMemo(
    () => JSON.stringify(nextInitialValues),
    [nextInitialValues],
  );
  const hydrationRef = useRef({
    postId,
    signature: nextInitialSignature,
  });
  const [values, setValues] = useState<PostFormValues>(nextInitialValues);
  const [isDirty, setIsDirty] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const recordChanged =
      mode === "edit" && hydrationRef.current.postId !== postId;
    const initialChanged =
      hydrationRef.current.signature !== nextInitialSignature;

    if (recordChanged || (!isDirty && initialChanged)) {
      setValues(nextInitialValues);
      setIsDirty(false);
      hydrationRef.current = {
        postId,
        signature: nextInitialSignature,
      };
    }
  }, [isDirty, mode, nextInitialSignature, nextInitialValues, postId]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoriesClient,
  });

  const mutation = useMutation({
    mutationFn: async (nextValues: PostFormValues) => {
      const payload = buildPayload(nextValues);

      if (mode === "edit") {
        if (postId === undefined) {
          throw new Error("수정할 글 ID가 없습니다.");
        }

        return updatePost(postId, payload);
      }

      return createPost(payload);
    },
    onSuccess: async (post) => {
      setIsDirty(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
      onSuccess?.(post);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "글 저장에 실패했습니다."));
    },
  });

  const categories = categoriesQuery.data
    ? getCategoryOptions(categoriesQuery.data)
    : [];

  const handleFieldChange = <Key extends keyof PostFormValues>(
    key: Key,
    value: PostFormValues[Key],
  ) => {
    setIsDirty(true);
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (values.categoryId === null) {
      setSubmitError("카테고리를 선택하세요.");

      return;
    }

    if (!values.title.trim()) {
      setSubmitError("제목을 입력하세요.");

      return;
    }

    setSubmitError(null);
    mutation.mutate(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)]"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FormField label="제목" htmlFor="title">
          <input
            id="title"
            name="title"
            type="text"
            value={values.title}
            onChange={(event) => handleFieldChange("title", event.target.value)}
            placeholder="글 제목"
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
          />
        </FormField>

        <FormField label="카테고리" htmlFor="categoryId">
          <select
            id="categoryId"
            name="categoryId"
            value={values.categoryId ?? ""}
            onChange={(event) =>
              handleFieldChange(
                "categoryId",
                event.target.value ? Number(event.target.value) : null,
              )
            }
            disabled={categoriesQuery.isPending}
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              {categoriesQuery.isPending
                ? "카테고리 불러오는 중..."
                : "카테고리 선택"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="태그" htmlFor="tags">
          <input
            id="tags"
            name="tags"
            type="text"
            value={values.tags}
            onChange={(event) => handleFieldChange("tags", event.target.value)}
            placeholder="react, nextjs, blog"
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
          />
        </FormField>

        <FormField label="상태" htmlFor="status">
          <select
            id="status"
            name="status"
            value={values.status}
            onChange={(event) =>
              handleFieldChange("status", event.target.value as Post["status"])
            }
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="가시성" htmlFor="visibility">
          <select
            id="visibility"
            name="visibility"
            value={values.visibility}
            onChange={(event) =>
              handleFieldChange(
                "visibility",
                event.target.value as Post["visibility"],
              )
            }
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="썸네일 URL" htmlFor="thumbnailUrl">
          <input
            id="thumbnailUrl"
            name="thumbnailUrl"
            type="url"
            value={values.thumbnailUrl}
            onChange={(event) =>
              handleFieldChange("thumbnailUrl", event.target.value)
            }
            placeholder="https://example.com/thumbnail.jpg"
            className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
          />
        </FormField>
      </div>

      {categoriesQuery.isError ? (
        <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/5 px-4 py-3 text-sm text-negative-1">
          {getErrorMessage(
            categoriesQuery.error,
            "카테고리 목록을 불러오지 못했습니다.",
          )}
        </div>
      ) : null}

      {submitError ? (
        <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/5 px-4 py-3 text-sm text-negative-1">
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              className="text-sm font-medium text-text-1"
              htmlFor="contentMd"
            >
              본문
            </label>
            <span className="text-xs uppercase tracking-[0.2em] text-text-4">
              Markdown
            </span>
          </div>
          <MarkdownEditor
            value={values.contentMd}
            onChange={(value) => handleFieldChange("contentMd", value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-1">미리보기</span>
            <span className="text-xs uppercase tracking-[0.2em] text-text-4">
              300ms debounce
            </span>
          </div>
          <MarkdownPreview value={values.contentMd} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border-3 pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "inline-flex items-center justify-center rounded-[0.9rem] border border-border-3 px-5 py-3 text-sm font-medium text-text-2 transition-colors",
              "hover:border-border-2 hover:text-text-1",
            )}
          >
            {cancelLabel}
          </button>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className={cn(
            "inline-flex items-center justify-center rounded-[0.9rem] bg-primary-1 px-5 py-3 text-sm font-semibold text-white transition-opacity",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {mutation.isPending
            ? "저장 중..."
            : getSubmitLabel(mode, submitLabel)}
        </button>
      </div>
    </form>
  );
}
