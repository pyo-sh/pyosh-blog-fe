import { notFound } from "next/navigation";
import { fetchPosts } from "@entities/post";
import { PostCard } from "@features/post-list";
import { Pagination } from "@shared/ui/libs";

interface SearchPageProps {
  searchParams?: {
    q?: string | string[];
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawQuery = getSingleValue(searchParams?.q);
  const query = rawQuery?.trim() ?? "";

  if (!query) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <section className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
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
  const response = await fetchPosts({ q: query, page });
  const posts = response.data;
  const { meta } = response;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Search Results
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">
          &quot;{query}&quot; 검색 결과
        </h1>
        <p className="mt-4 text-body-md text-text-3">
          총 {meta.total}개의 글을 찾았습니다.
        </p>
      </header>

      {posts.length > 0 ? (
        <>
          <section className="grid gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>

          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            basePath="/search"
            queryParams={{ q: query }}
          />
        </>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-border-3 bg-background-2 p-8 text-body-md text-text-3 md:p-10">
          검색 결과가 없습니다. 다른 키워드로 다시 시도해 주세요.
        </section>
      )}
    </main>
  );
}
