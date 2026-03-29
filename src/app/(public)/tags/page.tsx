import type { Metadata } from "next";
import { fetchTags } from "@entities/tag";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import { ArchiveTagBadge, EmptyState, ScrollToTop } from "@shared/ui/libs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "태그 목록",
  description: "모든 태그 목록",
  ...buildCanonicalMetadata("/tags"),
};

export default async function TagsPage() {
  const tags = await fetchTags();
  const sortedTags = [...tags].sort(
    (left, right) => right.postCount - left.postCount,
  );

  return (
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      <header className="mb-8 motion-reveal">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="break-keep text-body-lg font-bold tracking-tight text-text-1 sm:text-h1">
            태그
          </h1>
          <span className="text-body-sm text-text-4">
            총 {sortedTags.length.toLocaleString("ko-KR")}개 태그
          </span>
        </div>
        <div className="mt-4 h-px bg-border-4" />
      </header>

      {sortedTags.length > 0 ? (
        <section aria-label="태그 목록">
          <div className="flex flex-wrap gap-3">
            {sortedTags.map((tag) => (
              <ArchiveTagBadge
                key={tag.id}
                href={`/tags/${tag.slug}`}
                name={tag.name}
                count={tag.postCount}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          variant="page"
          className="bg-background-1"
          message="등록된 태그가 없습니다."
        />
      )}
      <ScrollToTop />
    </main>
  );
}
