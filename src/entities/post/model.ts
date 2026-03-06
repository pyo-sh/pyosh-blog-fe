export interface PostTag {
  id: number;
  name: string;
  slug: string;
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  contentMd: string;
  thumbnailUrl: string | null;
  visibility: "public" | "private";
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: PostCategory;
  tags: PostTag[];
}

export interface PostNavigation {
  slug: string;
  title: string;
}

export interface PostDetailResponse {
  post: Post;
}

export interface CreatePostBody {
  title: string;
  contentMd: string;
  categoryId: number;
  thumbnailUrl?: string | null;
  visibility?: "public" | "private";
  status?: "draft" | "published" | "archived";
  tags?: string[];
  publishedAt?: string;
}

export type UpdatePostBody = Partial<CreatePostBody>;
