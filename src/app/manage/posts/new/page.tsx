"use client";

import { useRouter } from "next/navigation";
import { ADMIN_CHROME_HEIGHT } from "../../ui/admin-shell-constants";
import { PostForm } from "@features/post-editor";

export default function ManagePostCreatePage() {
  const router = useRouter();

  return (
    <div
      className="-mx-4 -my-6 h-full w-full md:-mx-6"
      style={{ height: `calc(100dvh - ${ADMIN_CHROME_HEIGHT})` }}
    >
      <div className="h-full w-full">
        <PostForm
          mode="create"
          onSuccess={() => router.push("/manage/posts")}
        />
      </div>
    </div>
  );
}
