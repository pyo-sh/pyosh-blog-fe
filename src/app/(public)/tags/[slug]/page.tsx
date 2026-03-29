import { cache } from "react";
import type { Metadata } from "next";
import { Icon } from "@iconify/react";
import tagLinear from "@iconify-icons/solar/tag-linear";
import { notFound } from "next/navigation";
import { fetchPosts } from "@entities/post";
import { fetchTags } from "@entities/tag";
import { PostListItem } from "@features/post-list";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import { buildBreadcrumbJsonLd, getSiteUrl } from "@shared/lib/structured-data";
import { JsonLd } from "@shared/ui/json-ld";
import {
  ArchiveHeader,
  EmptyState,
  Pagination,
  ScrollToTop,
} from "@shared/ui/libs";

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
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      {siteUrl ? (
        <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems, siteUrl)} />
      ) : null}
      <ArchiveHeader variant="tag" title={activeTag.name} count={meta.total} />

      {posts.length > 0 ? (
        <section className="grid gap-5">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <EmptyState
          variant="page"
          icon={
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-3">
              <Icon
                icon={tagLinear}
                width="28"
                aria-hidden="true"
                className="text-text-4"
              />
            </div>
          }
          title="아직 이 태그에 연결된 공개 글이 없습니다."
          description="곧 새로운 글로 찾아올게요."
        />
      )}

      <div className="mt-10">
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          basePath={`/tags/${activeTag.slug}`}
        />
      </div>
      <ScrollToTop />
    </main>
  );
}
