import { cache } from "react";
import type { Metadata } from "next";
import { Icon } from "@iconify/react";
import eyeLinear from "@iconify-icons/solar/eye-linear";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchMeServer } from "@entities/auth";
import { fetchCategories, getCategoryAncestors } from "@entities/category";
import {
  fetchComments,
  type Comment,
  type CommentListMeta,
} from "@entities/comment";
import { fetchPosts, fetchPostBySlug } from "@entities/post";
import { CommentList } from "@features/comment-section";
import { PostContent, RelatedPosts, ViewCounter } from "@features/post-detail";
import { ApiResponseError } from "@shared/api";
import { extractHeadings, type TocItem } from "@shared/lib/markdown";
import { buildPostHref } from "@shared/lib/post-url";
import {
  buildCanonicalMetadata,
  getSiteLocale,
  getSiteName,
} from "@shared/lib/seo";
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  getPostDescription,
  getSiteUrl,
} from "@shared/lib/structured-data";
import { JsonLd } from "@shared/ui/json-ld";
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

const getPostDetail = cache(async (slug: string) => {
  console.log("[diag:post-page:getPostDetail]", { slug });

  try {
    return await fetchPostBySlug(slug);
  } catch (error) {
    console.warn("[diag:post-page:getPostDetail:error]", {
      slug,
      status:
        error instanceof ApiResponseError ? error.statusCode : "unknown_error",
    });

    if (error instanceof ApiResponseError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
});

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

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  console.log("[diag:post-page:generateMetadata]", { slug: params.slug });

  const { post } = await getPostDetail(params.slug);
  const description = getPostDescription(post);
  const canonical = buildPostHref(post.slug);

  return {
    title: post.title,
    ...(description ? { description } : {}),
    ...buildCanonicalMetadata(canonical),
    openGraph: {
      url: canonical,
      type: "article",
      siteName: getSiteName(),
      locale: getSiteLocale(),
      title: post.title,
      ...(description ? { description } : {}),
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.contentModifiedAt ?? post.publishedAt ?? undefined,
      tags: post.tags.map((tag) => tag.name),
      ...(post.thumbnailUrl ? { images: [post.thumbnailUrl] } : {}),
    },
    twitter: {
      card: post.thumbnailUrl ? "summary_large_image" : "summary",
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  console.log("[diag:post-page:render]", { slug: params.slug });
  
  try {
    const { post } = await getPostDetail(params.slug);
    const headings = extractHeadings(post.contentMd);
    let comments: Comment[] = [];
    let commentMeta: CommentListMeta = {
      page: 1,
      limit: 10,
      totalCount: 0,
      totalRootComments: 0,
      totalPages: 1,
    };
    let commentError: string | null = null;
    const cookieHeader = await toCookieHeader();
    const siteUrl = getSiteUrl();

  const [relatedPostsData, fetchedComments, categoryAncestors] =
    await Promise.all([
      post.category
        ? fetchPosts({ categoryId: post.category.id, limit: 7 }).catch(
            () => null,
          )
        : Promise.resolve(null),
      post.commentStatus === "disabled"
        ? Promise.resolve(null)
        : fetchComments(post.id, undefined, cookieHeader).catch(() => {
            commentError =
              "댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

            return null;
          }),
      post.category.ancestors
        ? Promise.resolve(post.category.ancestors)
        : fetchCategories()
            .then((categories) =>
              getCategoryAncestors(categories, post.category.id),
            )
            .catch(() => []),
    ]);
  if (fetchedComments) {
    comments = fetchedComments.data;
    commentMeta = fetchedComments.meta;
  }
  const relatedPosts =
    relatedPostsData?.data.filter((p) => p.id !== post.id).slice(0, 5) ?? [];
  const breadcrumbItems = [
    { name: "홈", href: "/" },
    ...categoryAncestors.map((ancestor) => ({
      name: ancestor.name,
      href: `/categories/${ancestor.slug}`,
    })),
    {
      name: post.category.name,
      href: `/categories/${post.category.slug}`,
    },
    { name: post.title },
  ];

  const viewer = await getCurrentViewer();
  const publishedAt = post.publishedAt ?? post.createdAt;
  const formattedViews = (post.totalPageviews ?? 0).toLocaleString("ko-KR");

  return (
    <main className="w-full pt-8 pb-16">
      {siteUrl ? <JsonLd data={buildBlogPostingJsonLd(post, siteUrl)} /> : null}
      {siteUrl ? (
        <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems, siteUrl)} />
      ) : null}
      <ViewCounter postId={post.id} />
      <article className="motion-reveal">
        {post.thumbnailUrl && (
          <div className="mb-6 overflow-hidden rounded-[1.5rem] bg-background-3">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1080px) 100vw, 896px"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Link
                href={`/categories/${post.category.slug}`}
                className="inline-flex items-center rounded-md bg-primary-1/12 px-2.5 py-1 text-ui-xs font-semibold text-primary-1 transition-colors hover:bg-primary-1/16"
              >
                {post.category.name}
              </Link>
              <time dateTime={publishedAt} className="text-ui-xs text-text-4">
                {formatDate(post.publishedAt, post.createdAt)}
              </time>
              <span
                className="inline-flex items-center gap-1 text-ui-xs text-text-4"
                aria-label={`조회수 ${formattedViews}회`}
              >
                <Icon icon={eyeLinear} width="14" aria-hidden="true" />
                {formattedViews}
              </span>
            </div>

            <h1
              className="break-keep text-[1.5rem] leading-[1.95rem] tracking-tight text-text-1 md:text-h1"
              style={{ fontWeight: 700 }}
            >
              {post.title}
            </h1>

            {post.description?.trim() ? (
              <p className="mt-4 break-keep text-body-base leading-[1.75] text-text-3">
                {post.description}
              </p>
            ) : null}

            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="inline-flex rounded-full border border-border-3 px-2.5 py-1 text-ui-xs font-medium text-text-3 transition-all duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary-1 hover:bg-primary-1/6 hover:text-primary-1"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {headings.length > 0 && (
            <script
              id="post-toc-data"
              type="application/json"
              dangerouslySetInnerHTML={{
                __html: serializeTocItems(headings),
              }}
            />
          )}

          <PostContent contentMd={post.contentMd} />

          {relatedPosts.length > 0 ? (
            <div className="mt-10">
              <RelatedPosts posts={relatedPosts} />
            </div>
          ) : null}
        </div>
      </article>

      {post.commentStatus !== "disabled" ? (
        <CommentList
          postId={post.id}
          initialComments={comments}
          initialMeta={commentMeta}
          viewer={viewer}
          initialError={commentError}
          commentStatus={post.commentStatus}
        />
      ) : null}
      <ScrollToTop />
    </main>
  );
}

function serializeTocItems(headings: TocItem[]) {
  return JSON.stringify(headings).replace(/</g, "\\u003c");
}
