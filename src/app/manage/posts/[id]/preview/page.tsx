import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { fetchAdminPost } from "@entities/post";
import { ApiResponseError } from "@shared/api";
import { renderMarkdown } from "@shared/lib/markdown";
import { PostPreview } from "@widgets/admin-post-preview";

interface PostPreviewPageProps {
  params: {
    id: string;
  };
}

async function toCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  if (!sessionCookie) {
    return undefined;
  }

  return `${sessionCookie.name}=${sessionCookie.value}`;
}

export default async function PostPreviewPage({
  params,
}: PostPreviewPageProps) {
  const id = Number(params.id);

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
