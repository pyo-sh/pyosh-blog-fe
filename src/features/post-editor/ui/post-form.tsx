"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryTreeSelect } from "./category-tree-select";
import { ImageGalleryModal } from "./image-gallery-modal";
import { MarkdownEditor } from "./markdown-editor";
import { MarkdownPreview } from "./markdown-preview";
import { PostCardPreview } from "./post-card-preview";
import { PreviewModal } from "./preview-modal";
import { PublishConfirmModal } from "./publish-confirm-modal";
import { TagChipInput } from "./tag-chip-input";
import { ThumbnailUploader } from "./thumbnail-uploader";
import { extractPlainText } from "../lib/extract-plain-text";
import {
  createPendingImage,
  getPendingImageIds,
  resolvePreviewContent,
  syncPendingImagesWithContent,
  uploadPendingImages,
  validatePendingImageFile,
  type PendingImage,
} from "../lib/image-handler";
import {
  insertMarkdownImage,
  insertMarkdownImages,
} from "../lib/markdown-commands";
import { attachScrollSync } from "../lib/scroll-sync";
import type { EditorView } from "@codemirror/view";
import { type Asset } from "@entities/asset";
import { fetchCategoriesAdmin, type Category } from "@entities/category";
import {
  createPost,
  updatePost,
  type CreatePostBody,
  type Post,
} from "@entities/post";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";
import { Spinner } from "@shared/ui/libs";

type EditorTab = "all" | "meta" | "content";
type PreviewMode = "split" | "editor";
type SubmitIntent =
  | "save"
  | "publish"
  | "archive"
  | "restore-draft"
  | "unpublish";

export interface PostFormValues {
  title: string;
  categoryId: number | null;
  tags: string[];
  status: Post["status"];
  visibility: Post["visibility"];
  commentStatus: "open" | "locked" | "disabled";
  thumbnailUrl: string;
  summary: string;
  description: string;
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
  tags: [],
  status: "draft",
  visibility: "public",
  commentStatus: "open",
  thumbnailUrl: "",
  summary: "",
  description: "",
  contentMd: "",
};

const VISIBILITY_OPTIONS: Array<{
  label: string;
  value: Post["visibility"];
}> = [
  { label: "공개", value: "public" },
  { label: "비공개", value: "private" },
];

const COMMENT_STATUS_OPTIONS: Array<{
  label: string;
  value: "open" | "locked" | "disabled";
}> = [
  { label: "열림", value: "open" },
  { label: "잠김", value: "locked" },
  { label: "비활성", value: "disabled" },
];

const TABS: Array<{ id: EditorTab; label: string; description: string }> = [
  {
    id: "all",
    label: "전체",
    description: "메타데이터와 본문을 함께 편집합니다.",
  },
  {
    id: "meta",
    label: "정보",
    description: "메타데이터와 글 목록 카드를 미리 봅니다.",
  },
  {
    id: "content",
    label: "글",
    description: "본문 작성과 미리보기에 집중합니다.",
  },
];

function createInitialValues(
  initialValues?: Partial<PostFormValues>,
): PostFormValues {
  return {
    ...DEFAULT_VALUES,
    ...initialValues,
    tags: initialValues?.tags ?? DEFAULT_VALUES.tags,
  };
}

function buildPayload(values: PostFormValues): CreatePostBody {
  return {
    title: values.title.trim(),
    categoryId: values.categoryId ?? 0,
    contentMd: values.contentMd,
    thumbnailUrl: values.thumbnailUrl.trim() || null,
    status: values.status,
    visibility: values.visibility,
    commentStatus: values.commentStatus,
    tags: values.tags.length > 0 ? values.tags : undefined,
    summary: values.summary.trim() || null,
    description: values.description.trim() || null,
  };
}

function mapPostToFormValues(post: Post): PostFormValues {
  return {
    title: post.title,
    categoryId: post.categoryId,
    tags: post.tags.map((tag) => tag.name),
    status: post.status,
    visibility: post.visibility,
    commentStatus: post.commentStatus ?? "open",
    thumbnailUrl: post.thumbnailUrl ?? "",
    summary: post.summary ?? "",
    description: post.description ?? "",
    contentMd: post.contentMd,
  };
}

function FormField({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label
      className="flex flex-col gap-2 text-sm text-text-2"
      htmlFor={htmlFor}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-text-1">{label}</span>
        {hint ? <span className="text-xs text-text-4">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function sortCategories(categories: Category[]): Category[] {
  return [...categories]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((category) => ({
      ...category,
      children: sortCategories(category.children ?? []),
    }));
}

export function PostForm({
  mode = "create",
  postId,
  initialValues,
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
  const [activeTab, setActiveTab] = useState<EditorTab>("all");
  const [isDirty, setIsDirty] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingIntent, setPendingIntent] = useState<SubmitIntent | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("split");
  const [isDesktopPreview, setIsDesktopPreview] = useState(false);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [pendingImages, setPendingImages] = useState<Map<string, PendingImage>>(
    () => new Map(),
  );
  const [isSummaryManuallyEdited, setIsSummaryManuallyEdited] = useState(
    Boolean(nextInitialValues.summary.trim()),
  );
  const previewRef = useRef<HTMLDivElement | null>(null);
  const pendingImagesRef = useRef(pendingImages);

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    const recordChanged =
      mode === "edit" && hydrationRef.current.postId !== postId;
    const initialChanged =
      hydrationRef.current.signature !== nextInitialSignature;

    if (recordChanged || (!isDirty && initialChanged)) {
      setValues(nextInitialValues);
      setIsDirty(false);
      setIsSummaryManuallyEdited(Boolean(nextInitialValues.summary.trim()));
      hydrationRef.current = {
        postId,
        signature: nextInitialSignature,
      };
    }
  }, [isDirty, mode, nextInitialSignature, nextInitialValues, postId]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const updateViewport = () => {
      setIsDesktopPreview(mediaQuery.matches);
      setPreviewMode((current) => (mediaQuery.matches ? current : "editor"));
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    setPendingImages((current) =>
      syncPendingImagesWithContent(values.contentMd, current),
    );
  }, [values.contentMd]);

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.blobUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (!editorView || !previewRef.current || !isDesktopPreview) {
      return;
    }

    if (previewMode !== "split" || activeTab === "meta") {
      return;
    }

    return attachScrollSync(editorView, previewRef.current);
  }, [activeTab, editorView, isDesktopPreview, previewMode]);

  const categoriesQuery = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => fetchCategoriesAdmin(),
  });

  const mutation = useMutation({
    mutationFn: async (nextValues: PostFormValues) => {
      const uploaded = await uploadPendingImages(
        nextValues.contentMd,
        pendingImages,
        setPendingImages,
      );
      const payload = buildPayload({
        ...nextValues,
        contentMd: uploaded.contentMd,
      });

      if (mode === "edit") {
        if (postId === undefined) {
          throw new Error("수정할 글 ID가 없습니다.");
        }

        return updatePost(postId, payload);
      }

      return createPost(payload);
    },
    onSuccess: async (post) => {
      const persistedValues = mapPostToFormValues(post);

      pendingImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.blobUrl);
      });
      setValues(persistedValues);
      setPendingImages(new Map());
      setIsDirty(false);
      setIsSummaryManuallyEdited(Boolean(persistedValues.summary.trim()));
      setPendingIntent(null);
      setShowPublishConfirm(false);
      hydrationRef.current = {
        postId: post.id,
        signature: JSON.stringify(persistedValues),
      };
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-post", post.id] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
      onSuccess?.(post);
    },
    onError: (error) => {
      setPendingIntent(null);
      toast.error(getErrorMessage(error, "글 저장에 실패했습니다."));
    },
  });

  const categories = categoriesQuery.data
    ? sortCategories(categoriesQuery.data)
    : [];
  const selectedCategoryName = useMemo(() => {
    const stack = [...categories];

    while (stack.length > 0) {
      const category = stack.shift();
      if (!category) {
        continue;
      }
      if (category.id === values.categoryId) {
        return category.name;
      }
      stack.unshift(...(category.children ?? []));
    }

    return "";
  }, [categories, values.categoryId]);
  const isCategoryUnavailable =
    categoriesQuery.isPending ||
    (!categoriesQuery.isError && categories.length === 0);
  const previewContent = useMemo(
    () => resolvePreviewContent(values.contentMd, pendingImages),
    [pendingImages, values.contentMd],
  );
  const pendingImageCount = useMemo(
    () =>
      Array.from(new Set(getPendingImageIds(values.contentMd))).filter((id) =>
        pendingImages.has(id),
      ).length,
    [pendingImages, values.contentMd],
  );

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

  function handlePreviewModeChange(mode: PreviewMode) {
    if (mode === "split" && !isDesktopPreview) {
      return;
    }

    setPreviewMode(mode);
  }

  function insertPendingFiles(files: FileList | File[]) {
    if (!editorView) {
      return;
    }

    const fileList = Array.from(files);
    const nextPending: PendingImage[] = [];

    for (const file of fileList) {
      const validationError = validatePendingImageFile(file);

      if (validationError) {
        toast.error(validationError);
        continue;
      }

      const pending = createPendingImage(file);
      nextPending.push(pending);
    }

    if (nextPending.length === 0) {
      return;
    }

    setPendingImages((current) => {
      const next = new Map(current);

      nextPending.forEach((pending) => {
        next.set(pending.id, pending);
      });

      return next;
    });
    insertMarkdownImages(
      editorView,
      nextPending.map((pending) => ({
        alt: pending.alt,
        src: `pending-upload:${pending.id}`,
      })),
    );

    setShowImageGallery(false);
  }

  function insertExistingAsset(asset: Asset) {
    if (!editorView) {
      return;
    }

    const alt =
      asset.url
        .split("/")
        .pop()
        ?.replace(/\.[^./\\]+$/, "") || "이미지";
    insertMarkdownImage(editorView, alt, asset.url);
    setShowImageGallery(false);
  }

  function submitWithIntent(intent: SubmitIntent) {
    const nextValues: PostFormValues = {
      ...values,
      status:
        intent === "publish"
          ? "published"
          : intent === "archive"
            ? "archived"
            : intent === "restore-draft" || intent === "unpublish"
              ? "draft"
              : values.status,
      summary: isSummaryManuallyEdited
        ? values.summary
        : extractPlainText(values.contentMd, 200),
    };

    if (nextValues.categoryId === null) {
      setSubmitError("카테고리를 선택하세요.");

      return;
    }

    if (!nextValues.title.trim()) {
      setSubmitError("제목을 입력하세요.");

      return;
    }

    if (nextValues.title.trim().length > 200) {
      setSubmitError("제목은 200자 이하로 입력하세요.");

      return;
    }

    if (nextValues.summary.length > 200) {
      setSubmitError("summary는 200자 이하로 입력하세요.");

      return;
    }

    if (nextValues.description.length > 300) {
      setSubmitError("description은 300자 이하로 입력하세요.");

      return;
    }

    setSubmitError(null);
    setPendingIntent(intent);
    mutation.mutate(nextValues);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitWithIntent("save");
  }

  const secondaryAction =
    values.status === "archived"
      ? { label: "초안으로 복원", intent: "restore-draft" as const }
      : values.status === "published"
        ? { label: "발행 취소", intent: "unpublish" as const }
        : { label: "보관", intent: "archive" as const };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)]"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-text-4">
                Editor Views
              </p>
              <p className="mt-2 text-sm text-text-3">
                탭 전환은 동일 폼 안에서만 일어나며 입력값은 유지됩니다.
              </p>
            </div>
            {isDirty ? (
              <span className="rounded-full bg-warning-2 px-3 py-1 text-xs font-medium text-warning-1">
                저장되지 않은 변경
              </span>
            ) : null}
          </div>

          <div className="grid gap-2 rounded-[1.25rem] bg-background-1 p-2 md:grid-cols-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-[1rem] px-4 py-3 text-left transition-colors",
                  activeTab === tab.id
                    ? "bg-primary-1 text-white shadow-[0px_14px_30px_0px_rgba(138,111,224,0.2)]"
                    : "text-text-2 hover:bg-background-2 hover:text-text-1",
                )}
              >
                <div className="text-sm font-semibold">{tab.label}</div>
                <div
                  className={cn(
                    "mt-1 text-xs",
                    activeTab === tab.id ? "text-white/80" : "text-text-4",
                  )}
                >
                  {tab.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {submitError ? (
          <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/5 px-4 py-3 text-sm text-negative-1">
            {submitError}
          </div>
        ) : null}

        {categoriesQuery.isError ? (
          <div className="rounded-[1rem] border border-negative-1/20 bg-negative-1/5 px-4 py-3 text-sm text-negative-1">
            {getErrorMessage(
              categoriesQuery.error,
              "카테고리 목록을 불러오지 못했습니다.",
            )}
          </div>
        ) : null}

        {!categoriesQuery.isPending && categories.length === 0 ? (
          <div className="rounded-[1rem] border border-warning-1/20 bg-warning-2 px-4 py-3 text-sm text-warning-1">
            카테고리를 먼저 생성하세요.
          </div>
        ) : null}

        {activeTab !== "content" ? (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="제목"
                  htmlFor="title"
                  hint={`${values.title.length}/200`}
                >
                  <input
                    id="title"
                    name="title"
                    type="text"
                    maxLength={200}
                    value={values.title}
                    onChange={(event) =>
                      handleFieldChange("title", event.target.value)
                    }
                    placeholder="글 제목"
                    aria-label="제목"
                    className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
                  />
                </FormField>

                <FormField label="카테고리" htmlFor="categoryId">
                  <CategoryTreeSelect
                    categories={categories}
                    value={values.categoryId}
                    disabled={categoriesQuery.isPending}
                    onChange={(value) => handleFieldChange("categoryId", value)}
                  />
                </FormField>

                <FormField label="공개 여부" htmlFor="visibility">
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
                    aria-label="공개 여부"
                    className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
                  >
                    {VISIBILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="댓글 상태" htmlFor="commentStatus">
                  <select
                    id="commentStatus"
                    name="commentStatus"
                    value={values.commentStatus}
                    onChange={(event) =>
                      handleFieldChange(
                        "commentStatus",
                        event.target.value as PostFormValues["commentStatus"],
                      )
                    }
                    aria-label="댓글 상태"
                    className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
                  >
                    {COMMENT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="태그" htmlFor="tags">
                <TagChipInput
                  value={values.tags}
                  onChange={(nextTags) => handleFieldChange("tags", nextTags)}
                />
              </FormField>

              <FormField label="썸네일" htmlFor="thumbnailUrl">
                <ThumbnailUploader
                  value={values.thumbnailUrl}
                  onChange={(nextValue) =>
                    handleFieldChange("thumbnailUrl", nextValue)
                  }
                />
              </FormField>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Summary"
                  htmlFor="summary"
                  hint={`${values.summary.length}/200`}
                >
                  <textarea
                    id="summary"
                    name="summary"
                    maxLength={200}
                    rows={4}
                    value={values.summary}
                    onChange={(event) => {
                      setIsSummaryManuallyEdited(true);
                      handleFieldChange("summary", event.target.value);
                    }}
                    placeholder="글 목록과 카드에 표시될 짧은 요약"
                    aria-label="Summary"
                    className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
                  />
                </FormField>

                <FormField
                  label="Description"
                  htmlFor="description"
                  hint={`${values.description.length}/300`}
                >
                  <textarea
                    id="description"
                    name="description"
                    maxLength={300}
                    rows={4}
                    value={values.description}
                    onChange={(event) =>
                      handleFieldChange("description", event.target.value)
                    }
                    placeholder="검색/메타 태그용 설명"
                    aria-label="Description"
                    className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
                  />
                </FormField>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-border-3 bg-background-1 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-text-4">
                  실시간 요약
                </p>
                <div className="mt-3 grid gap-3 text-sm text-text-3">
                  <div className="rounded-[1rem] bg-background-2 p-4">
                    <span className="text-xs text-text-4">상태</span>
                    <p className="mt-1 font-medium text-text-1">
                      {values.status === "published"
                        ? "발행"
                        : values.status === "archived"
                          ? "보관"
                          : "초안"}
                    </p>
                  </div>
                  <div className="rounded-[1rem] bg-background-2 p-4">
                    <span className="text-xs text-text-4">카테고리</span>
                    <p className="mt-1 font-medium text-text-1">
                      {selectedCategoryName || "선택되지 않음"}
                    </p>
                  </div>
                  <div className="rounded-[1rem] bg-background-2 p-4">
                    <span className="text-xs text-text-4">자동 summary</span>
                    <p className="mt-1 leading-6 text-text-2">
                      {values.summary.trim() ||
                        extractPlainText(values.contentMd)}
                    </p>
                  </div>
                </div>
              </div>

              <PostCardPreview
                title={values.title}
                categoryName={selectedCategoryName}
                tags={values.tags}
                thumbnailUrl={values.thumbnailUrl}
                summary={values.summary}
                contentMd={values.contentMd}
                visibility={values.visibility}
                status={values.status}
              />
            </div>
          </section>
        ) : null}

        {activeTab !== "meta" ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-border-3 bg-background-1 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-4">
                  Preview Mode
                </p>
                <p className="mt-1 text-sm text-text-3">
                  XL 이상에서는 분할 미리보기를, 작은 화면에서는 모달 미리보기를
                  사용합니다.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!isDesktopPreview}
                  onClick={() => handlePreviewModeChange("split")}
                  className={cn(
                    "rounded-[0.9rem] border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    previewMode === "split"
                      ? "border-primary-1 bg-primary-1 text-white"
                      : "border-border-3 bg-background-2 text-text-2 hover:border-border-2 hover:text-text-1",
                  )}
                >
                  에디터 + 프리뷰
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewModeChange("editor")}
                  className={cn(
                    "rounded-[0.9rem] border px-4 py-2 text-sm font-medium transition-colors",
                    previewMode === "editor"
                      ? "border-primary-1 bg-primary-1 text-white"
                      : "border-border-3 bg-background-2 text-text-2 hover:border-border-2 hover:text-text-1",
                  )}
                >
                  에디터만
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="rounded-[0.9rem] border border-border-3 bg-background-2 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
                >
                  미리보기
                </button>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-4",
                previewMode === "split" && isDesktopPreview
                  ? "xl:grid-cols-2"
                  : "grid-cols-1",
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    id="contentMdLabel"
                    onClick={() =>
                      document.getElementById("contentMd")?.focus()
                    }
                    className="text-sm font-medium text-text-1"
                  >
                    본문
                  </label>
                  <span className="text-xs uppercase tracking-[0.2em] text-text-4">
                    Markdown
                  </span>
                </div>
                <MarkdownEditor
                  pendingImageCount={pendingImageCount}
                  labelId="contentMdLabel"
                  value={values.contentMd}
                  onEditorReady={setEditorView}
                  onChange={(value) => handleFieldChange("contentMd", value)}
                  onImageButtonClick={() => setShowImageGallery(true)}
                  onImageFiles={insertPendingFiles}
                  onBlur={(contentMd) => {
                    if (!isSummaryManuallyEdited) {
                      handleFieldChange(
                        "summary",
                        extractPlainText(contentMd, 200),
                      );
                    }
                  }}
                />
              </div>

              {previewMode === "split" && isDesktopPreview ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-1">
                      미리보기
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-text-4">
                      실시간 반영
                    </span>
                  </div>
                  <MarkdownPreview
                    value={previewContent}
                    containerRef={previewRef}
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border-3 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={mutation.isPending || isCategoryUnavailable}
              onClick={() => submitWithIntent(secondaryAction.intent)}
              className="rounded-[0.9rem] border border-border-3 px-5 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:opacity-60"
            >
              {secondaryAction.label}
            </button>
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-[0.9rem] border border-border-3 px-5 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
              >
                {cancelLabel}
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={mutation.isPending || isCategoryUnavailable}
              className="rounded-[0.9rem] border border-border-3 bg-background-1 px-5 py-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:opacity-60"
            >
              {mutation.isPending && pendingIntent === "save"
                ? "저장 중"
                : "저장"}
            </button>
            <button
              type="button"
              disabled={mutation.isPending || isCategoryUnavailable}
              onClick={() => setShowPublishConfirm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-[0.9rem] bg-primary-1 px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {mutation.isPending && pendingIntent !== null ? (
                <Spinner size="sm" />
              ) : null}
              {values.status === "published" ? "다시 발행" : "발행"}
            </button>
          </div>
        </div>
      </form>

      <PublishConfirmModal
        isOpen={showPublishConfirm}
        isPending={mutation.isPending && pendingIntent === "publish"}
        onClose={() => {
          if (!mutation.isPending) {
            setShowPublishConfirm(false);
          }
        }}
        onConfirm={() => submitWithIntent("publish")}
      />

      <PreviewModal
        isOpen={showPreviewModal}
        value={previewContent}
        onClose={() => setShowPreviewModal(false)}
      />

      <ImageGalleryModal
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        onSelectAsset={insertExistingAsset}
        onSelectLocalFiles={insertPendingFiles}
      />
    </>
  );
}
