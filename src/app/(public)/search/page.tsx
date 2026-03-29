import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SearchFilter } from "@entities/post";
import { SEARCH_FILTERS, fetchPosts } from "@entities/post";
import {
  SearchEmptyState,
  SearchForm,
  SearchResultItem,
} from "@features/search";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import { Pagination, ScrollToTop } from "@shared/ui/libs";

interface SearchPageProps {
  searchParams?: {
    q?: string | string[];
    page?: string | string[];
    filter?: string | string[];
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

function parseFilter(value?: string): SearchFilter {
  if (value && (SEARCH_FILTERS as string[]).includes(value)) {
    return value as SearchFilter;
  }

  return "title_content";
}

export function generateMetadata({ searchParams }: SearchPageProps): Metadata {
  const query = getSingleValue(searchParams?.q)?.trim() ?? "";
  const page = parsePage(getSingleValue(searchParams?.page));
  const filter = parseFilter(getSingleValue(searchParams?.filter));

  if (!query) {
    return {
      title: "검색",
      description: "블로그 글을 검색합니다.",
      ...buildCanonicalMetadata("/search"),
    };
  }

  return {
    title: `검색: ${query}`,
    description: `'${query}' 검색 결과`,
    ...buildCanonicalMetadata("/search", {
      q: query,
      filter,
      page,
    }),
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawQuery = getSingleValue(searchParams?.q);
  const query = rawQuery?.trim() ?? "";
  const filter = parseFilter(getSingleValue(searchParams?.filter));

  if (!query) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-6 px-4 pb-16 pt-8 md:px-6">
        <Suspense>
          <SearchForm currentFilter={filter} initialQuery="" />
        </Suspense>
        <SearchEmptyState
          title="검색어를 입력해 주세요"
          description="제목, 내용, 태그, 카테고리, 댓글로 검색할 수 있습니다"
        />
      </main>
    );
  }

  const page = parsePage(getSingleValue(searchParams?.page));
  const response = await fetchPosts({ q: query, filter, page });
  const posts = response.data;
  const { meta } = response;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-6 px-4 pb-16 pt-8 md:px-6">
      <Suspense>
        <SearchForm currentFilter={filter} initialQuery={query} />
      </Suspense>

      <header className="text-ui-base font-semibold text-text-2">
        <span className="font-bold text-primary-1">&quot;{query}&quot;</span>{" "}
        <span className="text-text-3">검색 결과 ({meta.total}건)</span>
      </header>

      {posts.length > 0 ? (
        <>
          <section className="flex flex-col gap-3" aria-label="검색 결과">
            {posts.map((post) => (
              <SearchResultItem key={post.id} post={post} query={query} />
            ))}
          </section>

          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            basePath="/search"
            queryParams={{ q: query, filter }}
          />
        </>
      ) : (
        <SearchEmptyState
          title="검색 결과가 없습니다"
          description="다른 검색어나 필터로 다시 시도해 보세요"
        />
      )}
      <ScrollToTop />
    </main>
  );
}
