"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { PostEditorScreen } from "../../post-editor-screen";
import type { PostFormValues } from "@features/post-editor";
import { fetchAdminPost } from "@entities/post";
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
      tags: postQuery.data.tags.map((tag) => tag.name),
      status: postQuery.data.status,
      visibility: postQuery.data.visibility,
      commentStatus: postQuery.data.commentStatus ?? "open",
      thumbnailUrl: postQuery.data.thumbnailUrl ?? "",
      summary: postQuery.data.summary ?? "",
      description: postQuery.data.description ?? "",
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
          onClick={() => router.push("/manage/posts")}
          className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <PostEditorScreen
      mode="edit"
      postId={postId}
      initialValues={initialValues}
      isPending={postQuery.isPending}
      errorMessage={
        postQuery.isError
          ? getErrorMessage(postQuery.error, "잠시 후 다시 시도해 주세요.")
          : null
      }
      onRetry={() => void postQuery.refetch()}
    />
  );
}
