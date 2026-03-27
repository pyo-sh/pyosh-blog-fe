import { PublicLayoutShell } from "./layout-shell";
import { fetchCategories } from "@entities/category";
import { fetchPosts } from "@entities/post";
import { fetchPopularPosts, fetchTotalViews } from "@entities/stat";
import { fetchTags } from "@entities/tag";
import { Footer } from "@widgets/footer";

const SIDEBAR_POST_LIMIT = 5;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [postsResponse, popularPosts, categories, tags, totalViews] =
    await Promise.all([
      fetchPosts({ limit: SIDEBAR_POST_LIMIT }),
      fetchPopularPosts(7).catch(() => []),
      fetchCategories(),
      fetchTags(),
      fetchTotalViews().catch(() => null),
    ]);

  return (
    <>
      <PublicLayoutShell
        recentPosts={postsResponse.data}
        popularPosts={popularPosts}
        categories={categories}
        tags={tags}
        totalViews={totalViews}
      >
        {children}
      </PublicLayoutShell>
      <Footer />
    </>
  );
}
