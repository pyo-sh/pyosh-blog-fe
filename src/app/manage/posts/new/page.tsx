"use client";

import { useRouter } from "next/navigation";
import { PostForm } from "@features/post-editor";

export default function ManagePostCreatePage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-[76rem]">
      <div className="overflow-hidden rounded-[1.75rem] border border-border-4 bg-background-1/90 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)]">
        <PostForm
          mode="create"
          cancelLabel="목록으로"
          onCancel={() => router.push("/manage/posts")}
          onSuccess={() => router.push("/manage/posts")}
        />
      </div>
    </div>
  );
}
