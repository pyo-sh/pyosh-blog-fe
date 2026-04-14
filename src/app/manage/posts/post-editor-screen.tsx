"use client";

import { useRouter } from "next/navigation";
import { ADMIN_CHROME_HEIGHT } from "../ui/admin-shell-constants";
import { PostForm, type PostFormValues } from "@features/post-editor";

interface PostEditorScreenProps {
  mode: "create" | "edit";
  postId?: number;
  initialValues?: Partial<PostFormValues>;
  isPending?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

function FullBleedFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="-mx-4 -my-6 h-full w-full md:-mx-6"
      style={{ height: `calc(100dvh - ${ADMIN_CHROME_HEIGHT})` }}
    >
      <div className="h-full w-full">{children}</div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 bg-background-1 p-4 md:p-6">
      <div className="h-14 animate-pulse rounded-2xl bg-background-2" />
      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="space-y-4 rounded-[1.5rem] bg-background-2 p-5">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-xl bg-background-3"
            />
          ))}
        </div>
        <div className="rounded-[1.5rem] bg-background-2 p-5">
          <div className="h-full min-h-[24rem] animate-pulse rounded-xl bg-background-3" />
        </div>
      </div>
    </div>
  );
}

function EditorError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex h-full items-center justify-center bg-background-1 p-4 md:p-6">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8">
        <h1 className="text-lg font-semibold text-negative-1">
          글을 불러오지 못했습니다.
        </h1>
        <p className="mt-2 text-sm text-negative-1">{message}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
            >
              다시 시도
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => router.push("/manage/posts")}
            className="inline-flex rounded-[0.75rem] border border-border-3 px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1"
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
}

export function PostEditorScreen({
  mode,
  postId,
  initialValues,
  isPending = false,
  errorMessage,
  onRetry,
}: PostEditorScreenProps) {
  const router = useRouter();

  return (
    <FullBleedFrame>
      {isPending ? (
        <EditorSkeleton />
      ) : errorMessage ? (
        <EditorError message={errorMessage} onRetry={onRetry} />
      ) : (
        <PostForm
          mode={mode}
          postId={postId}
          initialValues={initialValues}
          cancelLabel="목록으로"
          onCancel={() => router.push("/manage/posts")}
          onSuccess={() => router.push("/manage/posts")}
        />
      )}
    </FullBleedFrame>
  );
}
