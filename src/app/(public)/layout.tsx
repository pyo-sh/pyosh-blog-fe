import { PublicLayoutShell } from "./layout-shell";
import { fetchCategories } from "@entities/category";
import { fetchPosts } from "@entities/post";
import { fetchPopularPosts, fetchTotalViews } from "@entities/stat";
import { fetchTags } from "@entities/tag";
import { SiteViewCounter } from "@features/site-view-counter";
import { Footer } from "@widgets/footer";

const SIDEBAR_POST_LIMIT = 5;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [postsResponse, popularPosts, categories, tags, totalViews] =
    await Promise.all([
      fetchPosts({ limit: SIDEBAR_POST_LIMIT }).catch(() => ({ data: [] })),
      fetchPopularPosts(7).catch(() => []),
      fetchCategories().catch(() => []),
      fetchTags().catch(() => []),
      fetchTotalViews().catch(() => null),
    ]);

  return (
    <>
      {/* Public routes always record a site-wide visit separately from any per-post view. */}
      <SiteViewCounter />
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
