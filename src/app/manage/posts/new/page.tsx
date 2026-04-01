"use client";

import { useRouter } from "next/navigation";
import { PostForm } from "@features/post-editor";

export default function ManagePostCreatePage() {
  const router = useRouter();

  return (
    <div className="h-full w-full">
      <div className="h-full w-full">
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
