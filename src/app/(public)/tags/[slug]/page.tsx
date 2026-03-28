import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPosts } from "@entities/post";
import { fetchTags } from "@entities/tag";
import { PostListItem } from "@features/post-list";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import { buildBreadcrumbJsonLd, getSiteUrl } from "@shared/lib/structured-data";
import { JsonLd } from "@shared/ui/json-ld";
import { EmptyState, Pagination, ScrollToTop } from "@shared/ui/libs";

interface TagPostsPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    page?: string | string[];
  };
}

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string): number {
  if (value === undefined) {
    return 1;
  }

  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    notFound();
  }

  return page;
}

function isOutOfRangePage(page: number, totalPages: number) {
  if (totalPages === 0) {
    return page !== 1;
  }

  return page > totalPages;
}

const getTagPageData = cache(async (slug: string, page: number) => {
  const [tags, response] = await Promise.all([
    fetchTags(),
    fetchPosts({ tagSlug: slug, page }),
  ]);
  const activeTag = tags.find((tag) => tag.slug === slug);

  if (!activeTag || isOutOfRangePage(page, response.meta.totalPages)) {
    notFound();
  }

  return { activeTag, response };
});

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: TagPostsPageProps): Promise<Metadata> {
  const page = parsePage(getSingleValue(searchParams?.page));
  const { activeTag } = await getTagPageData(params.slug, page);

  return {
    title: `#${activeTag.name} - 글 목록`,
    description: `#${activeTag.name} 태그가 포함된 글 목록`,
    ...buildCanonicalMetadata(`/tags/${activeTag.slug}`, { page }),
  };
}

export default async function TagPostsPage({
  params,
  searchParams,
}: TagPostsPageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const { activeTag, response } = await getTagPageData(params.slug, page);

  const posts = response.data;
  const { meta } = response;
  const siteUrl = getSiteUrl();
  const breadcrumbItems = [
    { name: "홈", href: "/" },
    { name: "태그", href: "/tags" },
    { name: activeTag.name },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-8 px-4 py-12 md:px-6">
      {siteUrl ? (
        <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems, siteUrl)} />
      ) : null}
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Tag Archive
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">#{activeTag.name}</h1>
        <p className="mt-4 text-body-md text-text-3">
          총 {meta.total.toLocaleString("ko-KR")}개의 글이 이 태그와 연결되어
          있습니다.
        </p>
      </header>

      {posts.length > 0 ? (
        <section className="grid gap-5">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <EmptyState
          variant="page"
          message="아직 이 태그에 연결된 공개 글이 없습니다."
        />
      )}

      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        basePath={`/tags/${activeTag.slug}`}
      />
      <ScrollToTop />
    </main>
  );
}
