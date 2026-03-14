"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { fetchAdminPost } from "@entities/post";
import { PostForm, type PostFormValues } from "@features/post-editor";
import { ApiResponseError } from "@shared/api";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function EditPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)]">
        <div className="h-4 w-20 animate-pulse rounded-full bg-background-3" />
        <div className="mt-4 h-10 w-48 animate-pulse rounded-[1rem] bg-background-3" />
        <div className="mt-3 h-5 w-72 animate-pulse rounded-full bg-background-3" />
      </div>

      <div className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-[0.9rem] bg-background-3"
            />
          ))}
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-[1rem] bg-background-3"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPostEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = Number(params.id);

  const postQuery = useQuery({
    queryKey: ["admin-post", postId],
    queryFn: () => fetchAdminPost(postId),
    enabled: Number.isInteger(postId) && postId > 0,
  });

  const initialValues = useMemo<Partial<PostFormValues> | undefined>(() => {
    if (!postQuery.data) {
      return undefined;
    }

    return {
      title: postQuery.data.title,
      categoryId: postQuery.data.categoryId,
      tags: postQuery.data.tags.map((tag) => tag.name).join(", "),
      status: postQuery.data.status,
      visibility: postQuery.data.visibility,
      thumbnailUrl: postQuery.data.thumbnailUrl ?? "",
      contentMd: postQuery.data.contentMd,
    };
  }, [postQuery.data]);

  if (!Number.isInteger(postId) || postId <= 0) {
    return (
      <div className="rounded-[1.75rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8">
        <h1 className="text-lg font-semibold text-negative-1">
          잘못된 글 ID입니다.
        </h1>
        <p className="mt-2 text-sm text-negative-1">
          수정할 글을 다시 선택해 주세요.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/posts")}
          className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (postQuery.isPending) {
    return <EditPageSkeleton />;
  }

  if (postQuery.isError) {
    return (
      <div className="rounded-[1.75rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8">
        <h1 className="text-lg font-semibold text-negative-1">
          글을 불러오지 못했습니다.
        </h1>
        <p className="mt-2 text-sm text-negative-1">
          {getErrorMessage(postQuery.error, "잠시 후 다시 시도해 주세요.")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void postQuery.refetch()}
            className="inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/posts")}
            className="inline-flex rounded-[0.75rem] border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Content
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-text-1">글 수정</h1>
          <p className="mt-2 text-sm text-text-3">
            기존 글 정보를 불러와 수정한 뒤 다시 저장합니다.
          </p>
        </div>
      </header>

      <PostForm
        mode="edit"
        postId={postId}
        initialValues={initialValues}
        cancelLabel="목록으로"
        onCancel={() => router.push("/dashboard/posts")}
        onSuccess={() => router.push("/dashboard/posts")}
      />
    </div>
  );
}
