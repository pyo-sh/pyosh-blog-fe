export interface Post {
  id: string;
  title: string;
  contentMd: string;
  categoryId: string;
  thumbnailUrl: string | null;
  visibility: "public" | "private";
  status: "draft" | "published";
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostBody {
  title: string;
  contentMd: string;
  categoryId: string;
  thumbnailUrl?: string;
  visibility?: "public" | "private";
  status?: "draft" | "published";
  tags?: string[];
  publishedAt?: string;
}

export type UpdatePostBody = Partial<CreatePostBody>;
