"use client";

import { useRouter } from "next/navigation";
import { PostForm } from "@features/post-editor";

export default function DashboardPostCreatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Content
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-text-1">
            새 글 작성
          </h1>
          <p className="mt-2 text-sm text-text-3">
            초안 작성부터 발행 설정까지 한 번에 입력할 수 있습니다.
          </p>
        </div>
      </header>

      <PostForm
        mode="create"
        cancelLabel="목록으로"
        onCancel={() => router.push("/dashboard/posts")}
        onSuccess={() => router.push("/dashboard/posts")}
      />
    </div>
  );
}
