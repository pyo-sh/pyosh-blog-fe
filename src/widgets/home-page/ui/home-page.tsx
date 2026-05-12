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
    <main className="mx-auto flex w-full max-w-270 flex-col gap-3 pb-16 pt-8">
      <header
        className="motion-reveal pb-1"
        style={{ animationDelay: "100ms" }}
      >
        <h1 className="break-keep text-2xl leading-[1.938rem] font-bold tracking-tight text-text-1 md:text-3xl md:leading-9.5">
          최근 글
        </h1>
      </header>

      <PostList initialData={initialData} initialPage={page} />
    </main>
  );
}
