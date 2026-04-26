import { cache } from "react";
import type { Metadata } from "next";
import { Icon } from "@iconify/react";
import documentTextLinear from "@iconify-icons/solar/document-text-linear";
import { notFound } from "next/navigation";
import {
  fetchCategories,
  findCategoryBySlug,
  getCategoryAncestors,
} from "@entities/category";
import { fetchPosts } from "@entities/post";
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

const SIDEBAR_CATEGORY_PATH_DATA_ID = "sidebar-category-path-data";

interface CategoryPageProps {
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

const getCategoryPageData = cache(async (slug: string, page: number) => {
  const categories = await fetchCategories();
  const activeCategory = findCategoryBySlug(categories, slug);

  if (!activeCategory || !activeCategory.isVisible) {
    notFound();
  }

  const response = await fetchPosts({ categoryId: activeCategory.id, page });

  if (isOutOfRangePage(page, response.meta.totalPages)) {
    notFound();
  }

  return {
    categories,
    activeCategory,
    response,
  };
});

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const page = parsePage(getSingleValue(searchParams?.page));
  const { activeCategory } = await getCategoryPageData(params.slug, page);

  return {
    title: `${activeCategory.name} - 글 목록`,
    description: `${activeCategory.name} 카테고리의 글 목록`,
    ...buildCanonicalMetadata(`/categories/${activeCategory.slug}`, { page }),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const { categories, activeCategory, response } = await getCategoryPageData(
    params.slug,
    page,
  );

  const ancestors = getCategoryAncestors(categories, activeCategory.id);
  const siteUrl = getSiteUrl();
  const breadcrumbItems = [
    { name: "홈", href: "/" },
    ...ancestors.map((ancestor) => ({
      name: ancestor.name,
      href: `/categories/${ancestor.slug}`,
    })),
    { name: activeCategory.name },
  ];
  const posts = response.data;
  const { meta } = response;
  const breadcrumbLinks =
    ancestors.length > 0
      ? [
          ...ancestors.map((ancestor) => ({
            label: ancestor.name,
            href: `/categories/${ancestor.slug}`,
          })),
          { label: activeCategory.name },
        ]
      : undefined;
  const sidebarCategoryPathSlugs = [
    ...ancestors.map((ancestor) => ancestor.slug),
    activeCategory.slug,
  ];

  return (
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      {siteUrl ? (
        <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems, siteUrl)} />
      ) : null}
      <ArchiveHeader
        variant="category"
        title={activeCategory.name}
        count={meta.total}
        breadcrumbs={breadcrumbLinks}
      />

      <script
        id={SIDEBAR_CATEGORY_PATH_DATA_ID}
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: serializeCategoryPathSlugs(sidebarCategoryPathSlugs),
        }}
      />

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
                icon={documentTextLinear}
                width="28"
                aria-hidden="true"
                className="text-text-4"
              />
            </div>
          }
          title="아직 이 카테고리에 등록된 공개 글이 없습니다."
          description="곧 새로운 글로 찾아올게요."
        />
      )}

      <div className="mt-10">
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          basePath={`/categories/${activeCategory.slug}`}
        />
      </div>
      <ScrollToTop />
    </main>
  );
}

function serializeCategoryPathSlugs(categoryPathSlugs: string[]) {
  return JSON.stringify(categoryPathSlugs).replace(/</g, "\\u003c");
}
