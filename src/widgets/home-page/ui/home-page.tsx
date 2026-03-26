import { notFound } from "next/navigation";
import { fetchPosts } from "@entities/post";
import { PostList } from "@features/post-list";

interface HomePageProps {
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

export async function HomePage({ searchParams }: HomePageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const initialData = await fetchPosts({ page });

  if (isOutOfRangePage(page, initialData.meta.totalPages)) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-text-4">
          Latest Posts
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-1 md:text-3xl">
          블로그
        </h1>
        <p className="mt-2 text-sm text-text-3">
          최신 게시글을 페이지별로 살펴볼 수 있습니다.
        </p>
      </header>

      <PostList initialData={initialData} initialPage={page} />
    </main>
  );
}
