"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import archiveLinear from "@iconify-icons/solar/archive-linear";
import checkCircleLinear from "@iconify-icons/solar/check-circle-linear";
import uploadLinear from "@iconify-icons/solar/upload-linear";
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

type EditorTab = "all" | "info" | "editor-split" | "editor-only";
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

const COMMENT_STATUS_OPTIONS: Array<{
  label: string;
  value: "open" | "locked" | "disabled";
}> = [
  { label: "열림", value: "open" },
  { label: "잠김", value: "locked" },
  { label: "비활성", value: "disabled" },
];

const TABS: Array<{ id: EditorTab; label: string }> = [
  { id: "all", label: "전체" },
  { id: "info", label: "정보" },
  { id: "editor-split", label: "에디터 + 프리뷰" },
  { id: "editor-only", label: "에디터" },
];

const REMOVED_PENDING_IMAGE_TTL_MS = 30_000;
const PAGE_TAB_CLASS =
  "inline-flex h-8 items-center justify-center rounded-[0.375rem] px-[0.875rem] border-none bg-transparent text-[13px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/20";
const SECONDARY_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-[0.5rem] border border-border-3 bg-transparent px-4 text-sm font-medium text-text-2 transition-[background-color,transform] hover:bg-background-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/20 disabled:opacity-60";
const PRIMARY_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-[0.5rem] bg-primary-1 px-4 text-sm font-medium text-white transition-[opacity,transform] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/20 disabled:opacity-60";

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

function sortCategories(categories: Category[]): Category[] {
  return [...categories]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((category) => ({
      ...category,
      children: sortCategories(category.children ?? []),
    }));
}

function getVisibilityLabel(visibility: Post["visibility"]) {
  return visibility === "public" ? "공개" : "비공개";
}

function getCommentStatusDescription(
  commentStatus: PostFormValues["commentStatus"],
) {
  if (commentStatus === "locked") {
    return "기존 댓글만 표시";
  }

  if (commentStatus === "disabled") {
    return "댓글 영역 숨김";
  }

  return "댓글 작성 가능";
}

function CompactMetaLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="shrink-0 text-[11px] font-medium text-text-4">
        {label}
      </span>
      {children}
    </div>
  );
}

function MetaFormRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid gap-3 border-b border-border-4 pb-5 last:border-b-0 last:pb-0 md:grid-cols-[7rem_minmax(0,1fr)] md:items-start">
      <div className="pt-2 text-sm font-medium text-text-2">{label}</div>
      <div className="min-w-0">
        {children}
        {hint ? <p className="mt-2 text-xs text-text-4">{hint}</p> : null}
      </div>
    </div>
  );
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
  const removedPendingImagesRef = useRef<Map<string, PendingImage>>(new Map());
  const removedPendingImageTimersRef = useRef<Map<string, number>>(new Map());

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

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => {
      setIsDesktopPreview(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    setPendingImages((current) => {
      const activeIds = new Set(getPendingImageIds(values.contentMd));
      const restored = new Map(current);

      activeIds.forEach((id) => {
        if (restored.has(id)) {
          return;
        }

        const removed = removedPendingImagesRef.current.get(id);

        if (!removed) {
          return;
        }

        const timeoutId = removedPendingImageTimersRef.current.get(id);

        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
          removedPendingImageTimersRef.current.delete(id);
        }

        removedPendingImagesRef.current.delete(id);
        restored.set(id, {
          ...removed,
          blobUrl: URL.createObjectURL(removed.file),
        });
      });

      const synced = syncPendingImagesWithContent(values.contentMd, restored);

      synced.removedImages.forEach((image, id) => {
        removedPendingImagesRef.current.set(id, image);

        if (removedPendingImageTimersRef.current.has(id)) {
          window.clearTimeout(removedPendingImageTimersRef.current.get(id));
        }

        const timeoutId = window.setTimeout(() => {
          removedPendingImagesRef.current.delete(id);
          removedPendingImageTimersRef.current.delete(id);
        }, REMOVED_PENDING_IMAGE_TTL_MS);

        removedPendingImageTimersRef.current.set(id, timeoutId);
      });

      return synced.pendingImages;
    });
  }, [values.contentMd]);

  useEffect(() => {
    return () => {
      removedPendingImageTimersRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      pendingImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.blobUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (!editorView || !previewRef.current || !isDesktopPreview) {
      return;
    }

    if (activeTab !== "all" && activeTab !== "editor-split") {
      return;
    }

    return attachScrollSync(editorView, previewRef.current);
  }, [activeTab, editorView, isDesktopPreview]);

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
      removedPendingImageTimersRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      removedPendingImagesRef.current.clear();
      removedPendingImageTimersRef.current.clear();
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

  const shouldRenderEditor =
    activeTab === "all" ||
    activeTab === "editor-split" ||
    activeTab === "editor-only";
  const shouldRenderInlinePreview =
    shouldRenderEditor && activeTab !== "editor-only" && isDesktopPreview;
  const shouldRenderTitleField = activeTab === "all" || activeTab === "info";

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex h-full min-h-0 flex-col overflow-hidden bg-background-1"
      >
        <div className="border-b border-border-4 bg-background-2 px-4 py-2 md:px-6">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  PAGE_TAB_CLASS,
                  activeTab === tab.id
                    ? "bg-primary-1 text-white hover:bg-primary-1"
                    : "text-text-3 hover:bg-background-3 hover:text-text-1",
                )}
              >
                {tab.label}
              </button>
            ))}
            {isDirty ? (
              <span className="ml-auto rounded-full border border-warning-1/20 bg-warning-2 px-3 py-1 text-xs font-medium text-warning-1">
                저장되지 않은 변경
              </span>
            ) : null}
          </div>
        </div>

        {shouldRenderTitleField ? (
          <div className="border-b border-border-4 px-6 py-4">
            <input
              id="title"
              name="title"
              type="text"
              maxLength={200}
              value={values.title}
              onChange={(event) =>
                handleFieldChange("title", event.target.value)
              }
              placeholder="제목을 입력하세요"
              aria-label="제목"
              className="w-full border-none bg-transparent text-[1.8rem] font-semibold tracking-[-0.03em] text-text-1 outline-none placeholder:text-text-4 md:text-[2rem]"
            />
          </div>
        ) : null}

        {submitError ? (
          <div className="mx-5 mt-5 rounded-[1rem] border border-negative-1/20 bg-negative-1/5 px-4 py-3 text-sm text-negative-1 md:mx-6">
            {submitError}
          </div>
        ) : null}

        {categoriesQuery.isError ? (
          <div className="mx-5 mt-5 rounded-[1rem] border border-negative-1/20 bg-negative-1/5 px-4 py-3 text-sm text-negative-1 md:mx-6">
            {getErrorMessage(
              categoriesQuery.error,
              "카테고리 목록을 불러오지 못했습니다.",
            )}
          </div>
        ) : null}

        {!categoriesQuery.isPending && categories.length === 0 ? (
          <div className="mx-5 mt-5 rounded-[1rem] border border-warning-1/20 bg-warning-2 px-4 py-3 text-sm text-warning-1 md:mx-6">
            카테고리를 먼저 생성하세요.
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeTab === "all" ? (
            <section className="shrink-0 border-b border-border-4 px-6 py-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:gap-x-5 xl:gap-y-3">
                <CompactMetaLabel label="카테고리">
                  <div className="min-w-[10rem]">
                    <CategoryTreeSelect
                      categories={categories}
                      value={values.categoryId}
                      disabled={categoriesQuery.isPending}
                      onChange={(value) =>
                        handleFieldChange("categoryId", value)
                      }
                    />
                  </div>
                </CompactMetaLabel>

                <CompactMetaLabel label="태그">
                  <div className="min-w-[16rem] flex-1">
                    <TagChipInput
                      value={values.tags}
                      onChange={(nextTags) =>
                        handleFieldChange("tags", nextTags)
                      }
                    />
                  </div>
                </CompactMetaLabel>

                <CompactMetaLabel label="썸네일">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("info")}
                      className="inline-flex items-center rounded-[0.7rem] border border-border-3 bg-background-1 px-2.5 py-1.5 text-xs font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
                    >
                      에셋 갤러리에서 선택
                    </button>
                    <div className="overflow-hidden rounded-[0.6rem] border border-border-3 bg-background-2">
                      {values.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin preview URLs are allowed
                        <img
                          src={values.thumbnailUrl}
                          alt="썸네일 미리보기"
                          className="h-9 w-12 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-12 items-center justify-center text-[10px] text-text-4">
                          없음
                        </div>
                      )}
                    </div>
                  </div>
                </CompactMetaLabel>

                <CompactMetaLabel label="상태">
                  <div className="flex items-center gap-1">
                    {(["draft", "published"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleFieldChange("status", status)}
                        className={cn(
                          "rounded-[0.55rem] px-3 py-1.5 text-xs font-medium transition-colors",
                          values.status === status
                            ? status === "published"
                              ? "bg-positive-1/12 text-positive-1"
                              : "bg-background-3 text-text-1"
                            : "border border-border-3 text-text-3 hover:bg-background-3 hover:text-text-1",
                        )}
                      >
                        {status === "draft" ? "작성중" : "발행"}
                      </button>
                    ))}
                  </div>
                </CompactMetaLabel>

                <CompactMetaLabel label="공개">
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange(
                        "visibility",
                        values.visibility === "public" ? "private" : "public",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      values.visibility === "public"
                        ? "border-primary-1/20 bg-primary-1/10 text-primary-1"
                        : "border-border-3 bg-background-1 text-text-3",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        values.visibility === "public"
                          ? "bg-primary-1"
                          : "bg-text-4",
                      )}
                    />
                    {getVisibilityLabel(values.visibility)}
                  </button>
                </CompactMetaLabel>

                <CompactMetaLabel label="댓글 상태">
                  <div className="min-w-[7rem]">
                    <select
                      id="commentStatusCompact"
                      value={values.commentStatus}
                      onChange={(event) =>
                        handleFieldChange(
                          "commentStatus",
                          event.target.value as PostFormValues["commentStatus"],
                        )
                      }
                      aria-label="댓글 상태"
                      className="w-full rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-1.5 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
                    >
                      {COMMENT_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CompactMetaLabel>
              </div>
            </section>
          ) : null}

          {activeTab === "info" ? (
            <section className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_20rem]">
                <div className="space-y-5">
                  <MetaFormRow label="카테고리">
                    <CategoryTreeSelect
                      categories={categories}
                      value={values.categoryId}
                      disabled={categoriesQuery.isPending}
                      onChange={(value) =>
                        handleFieldChange("categoryId", value)
                      }
                    />
                  </MetaFormRow>

                  <MetaFormRow label="태그">
                    <TagChipInput
                      value={values.tags}
                      onChange={(nextTags) =>
                        handleFieldChange("tags", nextTags)
                      }
                    />
                  </MetaFormRow>

                  <MetaFormRow label="공개 설정" hint="발행된 글을 공개합니다">
                    <button
                      type="button"
                      onClick={() =>
                        handleFieldChange(
                          "visibility",
                          values.visibility === "public" ? "private" : "public",
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[0.9rem] border border-border-3 bg-background-2 px-4 py-3 text-left"
                    >
                      <span className="text-sm font-medium text-text-1">
                        {getVisibilityLabel(values.visibility)}
                      </span>
                      <span
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors",
                          values.visibility === "public"
                            ? "bg-primary-1"
                            : "bg-border-3",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                            values.visibility === "public"
                              ? "translate-x-6"
                              : "translate-x-1",
                          )}
                        />
                      </span>
                    </button>
                  </MetaFormRow>

                  <MetaFormRow
                    label="댓글 상태"
                    hint={`${
                      COMMENT_STATUS_OPTIONS.find(
                        (option) => option.value === values.commentStatus,
                      )?.label ?? "열림"
                    }: ${getCommentStatusDescription(values.commentStatus)}`}
                  >
                    <div className="max-w-[14rem]">
                      <select
                        id="commentStatus"
                        name="commentStatus"
                        value={values.commentStatus}
                        onChange={(event) =>
                          handleFieldChange(
                            "commentStatus",
                            event.target
                              .value as PostFormValues["commentStatus"],
                          )
                        }
                        aria-label="댓글 상태"
                        className="w-full rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
                      >
                        {COMMENT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </MetaFormRow>

                  <MetaFormRow
                    label="썸네일"
                    hint="드래그 앤 드롭으로도 업로드 가능"
                  >
                    <ThumbnailUploader
                      value={values.thumbnailUrl}
                      onChange={(nextValue) =>
                        handleFieldChange("thumbnailUrl", nextValue)
                      }
                    />
                  </MetaFormRow>

                  <MetaFormRow label="요약 (summary)">
                    <textarea
                      id="summary"
                      name="summary"
                      maxLength={200}
                      rows={3}
                      value={values.summary}
                      onChange={(event) => {
                        setIsSummaryManuallyEdited(true);
                        handleFieldChange("summary", event.target.value);
                      }}
                      placeholder="글 목록에 표시될 요약문을 입력하세요"
                      aria-label="Summary"
                      className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
                    />
                    <div className="mt-2 text-right text-xs text-text-4">
                      {values.summary.length} / 200자
                    </div>
                  </MetaFormRow>

                  <MetaFormRow label="설명 (description)" hint="SEO 메타 설명">
                    <textarea
                      id="description"
                      name="description"
                      maxLength={300}
                      rows={4}
                      value={values.description}
                      onChange={(event) =>
                        handleFieldChange("description", event.target.value)
                      }
                      placeholder="검색엔진에 표시될 설명을 입력하세요"
                      aria-label="Description"
                      className="rounded-[0.9rem] border border-border-3 bg-background-1 px-4 py-3 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
                    />
                    <div className="mt-2 text-right text-xs text-text-4">
                      {values.description.length} / 300자
                    </div>
                  </MetaFormRow>

                  <div className="border-t border-border-4 pt-5">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-4">
                      글 목록 아이템 미리보기
                    </p>
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
                </div>

                <div>
                  <div className="rounded-[1.1rem] border border-border-3 bg-background-2 p-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-4">
                      글 목록 미리보기
                    </p>
                    <PostCardPreview
                      title={values.title}
                      categoryName={selectedCategoryName}
                      tags={values.tags}
                      thumbnailUrl={values.thumbnailUrl}
                      summary={values.summary}
                      contentMd={values.contentMd}
                      visibility={values.visibility}
                      status={values.status}
                      compact
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {shouldRenderEditor ? (
            <section className="min-h-0 flex-1 px-6 py-5">
              {!isDesktopPreview &&
              (activeTab === "all" || activeTab === "editor-split") ? (
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="rounded-[0.85rem] border border-border-3 bg-background-2 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
                  >
                    미리보기
                  </button>
                </div>
              ) : null}

              <div
                className={cn(
                  "grid h-full min-h-0 gap-0 overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-1",
                  shouldRenderInlinePreview
                    ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                    : "grid-cols-1",
                )}
              >
                <div className="min-w-0 min-h-0">
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
                    className="h-full min-h-0 [&_.cm-editor]:h-full [&_.cm-editor]:min-h-0 [&_.cm-scroller]:h-full [&_.cm-scroller]:min-h-0"
                  />
                </div>

                {shouldRenderInlinePreview ? (
                  <div className="min-w-0 min-h-0 border-t border-border-3 bg-background-1 lg:border-l lg:border-t-0">
                    <MarkdownPreview
                      value={previewContent}
                      containerRef={previewRef}
                      className="h-full min-h-0 rounded-none border-0"
                      headerTitle="미리보기"
                    />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <div className="border-t border-border-3 bg-background-2 px-6 py-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={mutation.isPending || isCategoryUnavailable}
                onClick={() => submitWithIntent(secondaryAction.intent)}
                className={SECONDARY_BUTTON_CLASS}
              >
                <Icon icon={archiveLinear} width="16" aria-hidden="true" />
                {secondaryAction.label}
              </button>
              {isDirty ? (
                <span className="text-xs text-text-4">자동 저장 전</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-4">
                  <Icon
                    icon={checkCircleLinear}
                    width="14"
                    className="text-positive-1"
                    aria-hidden="true"
                  />
                  자동 저장됨
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className={SECONDARY_BUTTON_CLASS}
                >
                  {cancelLabel}
                </button>
              ) : null}
              <button
                type="submit"
                disabled={mutation.isPending || isCategoryUnavailable}
                className={SECONDARY_BUTTON_CLASS}
              >
                {mutation.isPending && pendingIntent === "save"
                  ? "저장 중"
                  : "저장 (초안)"}
              </button>
              <button
                type="button"
                disabled={mutation.isPending || isCategoryUnavailable}
                onClick={() => setShowPublishConfirm(true)}
                className={PRIMARY_BUTTON_CLASS}
              >
                {mutation.isPending && pendingIntent !== null ? (
                  <Spinner size="sm" />
                ) : (
                  <Icon icon={uploadLinear} width="16" aria-hidden="true" />
                )}
                {values.status === "published" ? "다시 발행" : "발행"}
              </button>
            </div>
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
        title={values.title}
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
