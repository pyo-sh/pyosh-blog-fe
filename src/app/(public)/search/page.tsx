import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SearchFilter } from "@entities/post";
import { SEARCH_FILTERS, fetchPosts } from "@entities/post";
import { SearchFilterDropdown, SearchResultItem } from "@features/search";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import { EmptyState, Pagination, ScrollToTop } from "@shared/ui/libs";

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
      <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-8 px-4 py-12 md:px-6">
        <section className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Suspense>
              <SearchFilterDropdown currentFilter={filter} query="" />
            </Suspense>
          </div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Search
          </p>
          <h1 className="mt-3 text-heading-md text-text-1">
            검색어를 입력해 주세요
          </h1>
          <p className="mt-4 max-w-2xl text-body-md text-text-3">
            상단 검색창에서 키워드를 입력하면 관련 글을 찾아볼 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

  const page = parsePage(getSingleValue(searchParams?.page));
  const response = await fetchPosts({ q: query, filter, page });
  const posts = response.data;
  const { meta } = response;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-8 px-4 py-12 md:px-6">
      {/* Filter + search header */}
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Suspense>
            <SearchFilterDropdown currentFilter={filter} query={query} />
          </Suspense>
        </div>
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Search Results
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">
          <span className="font-medium text-primary-1">
            &quot;{query}&quot;
          </span>{" "}
          <span className="text-text-3">검색 결과 ({meta.total}건)</span>
        </h1>
      </header>

      {posts.length > 0 ? (
        <>
          <section className="flex flex-col gap-5">
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
        <EmptyState
          variant="page"
          message="검색 결과가 없습니다. 다른 키워드로 다시 시도해 주세요."
        />
      )}
      <ScrollToTop />
    </main>
  );
}
