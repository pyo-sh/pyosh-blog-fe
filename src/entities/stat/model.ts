export interface DashboardStats {
  todayPageviews: number;
  weekPageviews: number;
  monthPageviews: number;
  totalPosts: number;
  totalComments: number;
  postsByStatus: {
    draft: number;
    published: number;
    archived: number;
  };
}

export interface PopularPost {
  postId: number;
  slug: string;
  title: string;
  pageviews: number;
  uniques: number;
}
