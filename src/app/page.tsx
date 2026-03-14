import { notFound } from "next/navigation";
import { fetchPosts } from "@entities/post";
import { PostCard } from "@features/post-list";
import { Pagination } from "@shared/ui/libs";

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

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const response = await fetchPosts({ page });
  const posts = response.data;
  const { meta } = response;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Latest Posts
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">블로그</h1>
        <p className="mt-4 text-body-md text-text-3">
          최신 게시글을 페이지별로 살펴볼 수 있습니다.
        </p>
      </header>

      {posts.length > 0 ? (
        <>
          <section className="grid gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>

          {meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              basePath="/"
            />
          )}
        </>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-border-3 bg-background-2 p-8 text-body-md text-text-3 md:p-10">
          찾으시는 게시물은 없습니다
        </section>
      )}
    </main>
  );
}
