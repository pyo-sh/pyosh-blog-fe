import { notFound } from "next/navigation";
import { fetchPosts } from "@entities/post";
import { fetchTags } from "@entities/tag";
import { PostListItem } from "@features/post-list";
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

export const dynamic = "force-dynamic";

export default async function TagPostsPage({
  params,
  searchParams,
}: TagPostsPageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const [tags, response] = await Promise.all([
    fetchTags(),
    fetchPosts({ tagSlug: params.slug, page }),
  ]);
  const activeTag = tags.find((tag) => tag.slug === params.slug);

  if (!activeTag) {
    notFound();
  }

  const posts = response.data;
  const { meta } = response;

  if (isOutOfRangePage(page, meta.totalPages)) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-8 px-4 py-12 md:px-6">
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
