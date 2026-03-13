import { notFound } from "next/navigation";
import { fetchCategories } from "@entities/category";
import { CategoryNav } from "@widgets/category-nav";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categories = await fetchCategories();
  const visibleCategories = categories.filter((category) => category.isVisible);
  const activeCategory = visibleCategories.find(
    (category) => category.slug === params.slug,
  );

  if (!activeCategory) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <CategoryNav categories={categories} activeSlug={activeCategory.slug} />
      <section className="rounded-3xl border border-border-3 bg-background-2 p-8">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Category
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">
          {activeCategory.name}
        </h1>
        <p className="mt-4 max-w-2xl text-body-md text-text-3">
          카테고리별 포스트 목록은 다음 작업에서 연결될 예정입니다. 현재는
          카테고리 네비게이션 경로를 먼저 제공합니다.
        </p>
      </section>
    </main>
  );
}
