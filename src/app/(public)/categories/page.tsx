import type { Metadata } from "next";
import { fetchCategories } from "@entities/category";
import {
  CategoryTree,
  countVisibleCategories,
  countVisibleCategoryNodes,
} from "@features/category-tree";
import { formatNumber } from "@shared/lib/format-number";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import { ArchiveHeader, EmptyState, ScrollToTop } from "@shared/ui/libs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: "블로그 전체 카테고리 목록",
  ...buildCanonicalMetadata("/categories"),
};

export default async function CategoriesPage() {
  const categories = await fetchCategories();
  const visibleCategoryCount = countVisibleCategoryNodes(categories);
  const visiblePostCount = countVisibleCategories(categories);
  const headerSummary = `총 ${formatNumber(visibleCategoryCount)}개 분류`;

  return (
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      <ArchiveHeader
        variant="category"
        eyebrow="Category Directory"
        title="카테고리"
        summary={headerSummary}
      />

      {visibleCategoryCount > 0 ? (
        <section aria-label="카테고리 목록" className="motion-reveal">
          <div className="mb-7 overflow-hidden rounded-[0.875rem] border border-border-4 bg-background-2">
            <dl className="grid grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1 px-5 py-4 sm:px-[1.125rem]">
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-text-4">
                  분류
                </dt>
                <dd className="font-['Outfit'] text-[1.625rem] leading-none font-bold tracking-[-0.02em] text-text-1 tabular-nums">
                  {formatNumber(visibleCategoryCount)}
                </dd>
              </div>
              <div className="flex min-w-0 flex-col gap-1 border-l border-border-4 px-5 py-4 sm:px-[1.125rem]">
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-text-4">
                  공개 글
                </dt>
                <dd className="font-['Outfit'] text-[1.625rem] leading-none font-bold tracking-[-0.02em] text-text-1 tabular-nums">
                  {formatNumber(visiblePostCount)}
                </dd>
              </div>
            </dl>
          </div>
          <CategoryTree
            categories={categories}
            showOverviewLink={false}
            variant="overview"
          />
        </section>
      ) : (
        <EmptyState
          variant="page"
          className="bg-background-1"
          message="등록된 카테고리가 없습니다."
        />
      )}
      <ScrollToTop />
    </main>
  );
}
