import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { fetchAdminPost } from "@entities/post";
import { ApiResponseError } from "@shared/api";
import { renderMarkdown } from "@shared/lib/markdown";
import { PostPreview } from "@widgets/admin-post-preview";

interface PostPreviewPageProps {
  // Next.js 15: params is a Promise. await is a no-op in Next.js 14.
  params: Promise<{ id: string }>;
}

async function toCookieHeader(): Promise<string | undefined> {
  // await is a no-op in Next.js 14 but required in Next.js 15 where cookies() returns a Promise.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  if (!sessionCookie) {
    return undefined;
  }

  return `${sessionCookie.name}=${encodeURIComponent(sessionCookie.value)}`;
}

export default async function PostPreviewPage({
  params,
}: PostPreviewPageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const cookieHeader = await toCookieHeader();

  try {
    const post = await fetchAdminPost(id, cookieHeader);
    const renderedContent = await renderMarkdown(post.contentMd);

    return <PostPreview post={post} renderedContent={renderedContent} />;
  } catch (error) {
    if (error instanceof ApiResponseError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}
