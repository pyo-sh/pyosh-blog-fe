import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchCategories,
  findCategoryBySlug,
  getCategoryAncestors,
} from "@entities/category";
import { fetchPosts } from "@entities/post";
import { PostListItem } from "@features/post-list";
import { buildBreadcrumbJsonLd, getSiteUrl } from "@shared/lib/structured-data";
import { JsonLd } from "@shared/ui/json-ld";
import { EmptyState, Pagination, ScrollToTop } from "@shared/ui/libs";

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

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const categories = await fetchCategories();
  const activeCategory = findCategoryBySlug(categories, params.slug);

  if (!activeCategory || !activeCategory.isVisible) {
    notFound();
  }

  const ancestors = getCategoryAncestors(categories, activeCategory.id);
  const breadcrumbItems = [
    { name: "홈", href: "/" },
    ...ancestors.map((ancestor) => ({
      name: ancestor.name,
      href: `/categories/${ancestor.slug}`,
    })),
    { name: activeCategory.name },
  ];

  const response = await fetchPosts({ categoryId: activeCategory.id, page });
  const posts = response.data;
  const { meta } = response;

  if (isOutOfRangePage(page, meta.totalPages)) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-8 px-4 py-12 md:px-6">
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems, getSiteUrl())} />
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Category Archive
        </p>
        {ancestors.length > 0 ? (
          <nav
            aria-label="카테고리 경로"
            className="mt-3 flex flex-wrap items-center gap-1 text-body-xs text-text-4"
          >
            {ancestors.map((ancestor, index) => (
              <BreadcrumbItem
                key={ancestor.id}
                href={`/categories/${ancestor.slug}`}
                showSeparator={index > 0}
              >
                {ancestor.name}
              </BreadcrumbItem>
            ))}
            <span aria-hidden="true">{">"}</span>
            <span className="text-text-3">{activeCategory.name}</span>
          </nav>
        ) : null}
        <h1 className="mt-3 text-heading-md text-text-1">
          {activeCategory.name}
        </h1>
        <p className="mt-4 text-body-md text-text-3">
          총 {meta.total.toLocaleString("ko-KR")}개의 글이 이 카테고리에
          등록되어 있습니다.
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
          message="아직 이 카테고리에 등록된 공개 글이 없습니다."
        />
      )}

      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        basePath={`/categories/${activeCategory.slug}`}
      />
      <ScrollToTop />
    </main>
  );
}

function BreadcrumbItem({
  href,
  showSeparator,
  children,
}: {
  href: string;
  showSeparator: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {showSeparator ? <span aria-hidden="true">{">"}</span> : null}
      <Link href={href} className="transition-colors hover:text-text-2">
        {children}
      </Link>
    </>
  );
}
