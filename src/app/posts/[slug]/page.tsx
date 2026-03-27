import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchMeServer } from "@entities/auth";
import { fetchComments, type Comment } from "@entities/comment";
import { fetchPostBySlug } from "@entities/post";
import { CommentList } from "@features/comment-section";
import {
  PostContent,
  PostNavigation,
  ViewCounter,
} from "@features/post-detail";
import { ApiResponseError } from "@shared/api";
import { ScrollToTop } from "@shared/ui/libs";

interface PostDetailPageProps {
  params: {
    slug: string;
  };
}

interface CurrentViewer {
  type: "guest" | "oauth";
  id?: number;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value: string | null, fallback: string): string {
  return dateFormatter.format(new Date(value ?? fallback));
}

async function toCookieHeader() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  if (!sessionCookie) {
    return undefined;
  }

  return `${sessionCookie.name}=${sessionCookie.value}`;
}

async function getCurrentViewer(): Promise<CurrentViewer> {
  const cookieHeader = await toCookieHeader();

  if (!cookieHeader) {
    return { type: "guest" };
  }

  try {
    const viewer = await fetchMeServer(cookieHeader);

    if (viewer.type === "oauth") {
      return {
        type: "oauth",
        id: viewer.id,
      };
    }
  } catch (error) {
    if (error instanceof ApiResponseError && error.statusCode === 401) {
      return { type: "guest" };
    }
  }

  return { type: "guest" };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  try {
    const { post, prevPost, nextPost } = await fetchPostBySlug(params.slug);
    let comments: Comment[] = [];
    let commentError: string | null = null;
    const cookieHeader = await toCookieHeader();

    try {
      comments = await fetchComments(post.id, cookieHeader);
    } catch (error) {
      if (error instanceof ApiResponseError && error.statusCode === 404) {
        throw error;
      }

      commentError = "댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }

    const viewer = await getCurrentViewer();

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <ViewCounter postId={post.id} />
        <article className="overflow-hidden rounded-[2rem] border border-border-3 bg-background-2">
          {post.thumbnailUrl && (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-background-3">
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 960px"
              />
            </div>
          )}

          <div className="flex flex-col gap-8 px-8 py-10">
            <header className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3 text-body-xs uppercase tracking-[0.2em] text-text-4">
                <Link
                  href={`/categories/${post.category.slug}`}
                  className="transition-colors hover:text-text-2"
                >
                  {post.category.name}
                </Link>
                <span aria-hidden="true">•</span>
                <time dateTime={post.publishedAt ?? post.createdAt}>
                  {formatDate(post.publishedAt, post.createdAt)}
                </time>
              </div>

              <h1 className="text-heading-lg text-text-1">{post.title}</h1>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-border-3 px-3 py-1.5 text-body-sm text-text-3 transition-colors hover:border-border-2 hover:text-text-2"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <PostContent contentMd={post.contentMd} />
          </div>
        </article>

        <PostNavigation prevPost={prevPost} nextPost={nextPost} />
        <CommentList
          postId={post.id}
          initialComments={comments}
          viewer={viewer}
          initialError={commentError}
        />
        <ScrollToTop />
      </main>
    );
  } catch (error) {
    if (error instanceof ApiResponseError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}
