import type { Metadata } from "next";
import { fetchCategories } from "@entities/category";
import {
  CategoryTree,
  countVisibleCategories,
  countVisibleCategoryNodes,
} from "@features/category-tree";
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

  return (
    <main className="flex min-h-screen flex-col pt-8 pb-16">
      <ArchiveHeader
        variant="category"
        eyebrow="Category Directory"
        title="Categories"
        summary={
          <>
            총 {visibleCategoryCount.toLocaleString("ko-KR")}개 분류 · 공개 글{" "}
            {visiblePostCount.toLocaleString("ko-KR")}개
          </>
        }
      />

      {visibleCategoryCount > 0 ? (
        <section aria-label="카테고리 목록">
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
