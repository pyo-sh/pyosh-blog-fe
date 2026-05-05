import { notFound, redirect } from "next/navigation";
import { PostEditorScreen } from "../../post-editor-screen";
import { toAdminPostCookieHeader } from "../admin-post-cookie";
import { fetchAdminPost } from "@entities/post";
import { mapPostToFormValues } from "@features/post-editor/lib/post-form-values";
import { ApiResponseError } from "@shared/api";

export const dynamic = "force-dynamic";

interface DashboardPostEditPageProps {
  // Next.js 15: params is a Promise. await is a no-op in Next.js 14.
  params: Promise<{ id: string }>;
}

export default async function DashboardPostEditPage({
  params,
}: DashboardPostEditPageProps) {
  const { id: rawId } = await params;
  const postId = Number(rawId);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const cookieHeader = await toAdminPostCookieHeader();

  if (!cookieHeader) {
    redirect("/manage/login");
  }

  try {
    const post = await fetchAdminPost(postId, cookieHeader);

    return (
      <PostEditorScreen
        mode="edit"
        postId={postId}
        initialValues={mapPostToFormValues(post)}
      />
    );
  } catch (error) {
    if (error instanceof ApiResponseError) {
      if (error.statusCode === 404) {
        notFound();
      }

      if (error.statusCode === 401) {
        redirect("/manage/login");
      }

      if (error.statusCode === 403) {
        redirect("/manage/login?reason=forbidden");
      }
    }

    throw error;
  }
}
