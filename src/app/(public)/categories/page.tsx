import type { Metadata } from "next";
import { fetchCategories } from "@entities/category";
import {
  CategoryTree,
  countVisibleCategories,
  countVisibleCategoryNodes,
} from "@features/category-tree";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import { EmptyState, ScrollToTop } from "@shared/ui/libs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "카테고리 목록",
  description: "모든 카테고리 목록",
  ...buildCanonicalMetadata("/categories"),
};

export default async function CategoriesPage() {
  const categories = await fetchCategories();
  const visibleCategoryCount = countVisibleCategoryNodes(categories);
  const visiblePostCount = countVisibleCategories(categories);

  return (
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      <header className="mb-8 motion-reveal">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="break-keep text-body-lg font-bold tracking-tight text-text-1 sm:text-h1">
            카테고리
          </h1>
          <span className="text-body-sm text-text-4">
            총 {visibleCategoryCount.toLocaleString("ko-KR")}개 분류 · 공개 글{" "}
            {visiblePostCount.toLocaleString("ko-KR")}개
          </span>
        </div>
        <div className="mt-4 h-px bg-border-4" />
      </header>

      {visibleCategoryCount > 0 ? (
        <section aria-label="카테고리 목록">
          <CategoryTree categories={categories} showOverviewLink={false} />
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
