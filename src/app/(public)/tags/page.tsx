import type { Metadata } from "next";
import { fetchTags } from "@entities/tag";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import {
  ArchiveHeader,
  ArchiveTagBadge,
  EmptyState,
  ScrollToTop,
} from "@shared/ui/libs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tags",
  description: "블로그 전체 태그 목록",
  ...buildCanonicalMetadata("/tags"),
};

export default async function TagsPage() {
  const tags = await fetchTags();
  const sortedTags = [...tags].sort(
    (left, right) => right.postCount - left.postCount,
  );

  return (
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      <ArchiveHeader
        variant="tag"
        eyebrow="Tag Directory"
        title="Tags"
        summary={<>총 {sortedTags.length.toLocaleString("ko-KR")}개 태그</>}
      />

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
