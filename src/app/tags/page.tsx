import Link from "next/link";
import { fetchTags } from "@entities/tag";
import { EmptyState } from "@shared/ui/libs";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await fetchTags();
  const sortedTags = [...tags].sort(
    (left, right) => right.postCount - left.postCount,
  );
  const totalTaggedPosts = sortedTags.reduce(
    (count, tag) => count + tag.postCount,
    0,
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Tags
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">태그</h1>
        <p className="mt-4 max-w-2xl text-body-md text-text-3">
          {sortedTags.length}개의 태그와{" "}
          {totalTaggedPosts.toLocaleString("ko-KR")}건의 태그 연결을 확인할 수
          있습니다.
        </p>
      </header>

      {sortedTags.length > 0 ? (
        <section className="flex flex-wrap gap-3">
          {sortedTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-border-3 bg-background-1 px-5 py-3"
            >
              <div className="flex items-baseline gap-3">
                <h2 className="text-body-md font-semibold text-text-1">
                  #{tag.name}
                </h2>
                <p className="text-body-sm text-text-3">
                  {tag.postCount.toLocaleString("ko-KR")} posts
                </p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState message="등록된 태그가 없습니다." />
      )}
    </main>
  );
}
