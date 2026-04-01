"use client";

import { useRouter } from "next/navigation";
import { PostForm } from "@features/post-editor";

export default function ManagePostCreatePage() {
  const router = useRouter();

  return (
    <div>
      <PostForm
        mode="create"
        cancelLabel="목록으로"
        onCancel={() => router.push("/manage/posts")}
        onSuccess={() => router.push("/manage/posts")}
      />
    </div>
  );
}
