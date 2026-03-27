import { notFound } from "next/navigation";
import type { Category } from "@entities/category";
import { fetchCategories } from "@entities/category";
import { fetchPosts } from "@entities/post";
import { PostCard } from "@features/post-list";
import { Pagination } from "@shared/ui/libs";
import { CategoryNav } from "@widgets/category-nav";

interface CategoryPageProps {
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

function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }

    const childCategory = findCategoryBySlug(category.children ?? [], slug);

    if (childCategory) {
      return childCategory;
    }
  }

  return undefined;
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const categories = await fetchCategories();
  const activeCategory = findCategoryBySlug(categories, params.slug);

  if (!activeCategory || !activeCategory.isVisible) {
    notFound();
  }

  const response = await fetchPosts({ categoryId: activeCategory.id, page });
  const posts = response.data;
  const { meta } = response;

  if (isOutOfRangePage(page, meta.totalPages)) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-8 px-4 py-12 md:px-6">
      <CategoryNav categories={categories} activeSlug={activeCategory.slug} />

      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Category Archive
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">
          {activeCategory.name}
        </h1>
        <p className="mt-4 text-body-md text-text-3">
          총 {meta.total.toLocaleString("ko-KR")}개의 글이 이 카테고리에
          등록되어 있습니다.
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
              basePath={`/categories/${activeCategory.slug}`}
            />
          )}
        </>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-border-3 bg-background-2 p-8 text-body-md text-text-3 md:p-10">
          아직 이 카테고리에 등록된 공개 글이 없습니다.
        </section>
      )}
    </main>
  );
}
