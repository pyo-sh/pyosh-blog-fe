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

export interface PostDetailCategory extends PostCategory {
  ancestors: Array<{
    name: string;
    slug: string;
  }>;
}

export interface MatchedComment {
  body: string;
  authorName: string;
}

interface PostBase {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  visibility: "public" | "private";
  status: "draft" | "published" | "archived";
  commentStatus?: "open" | "locked" | "disabled";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  summary: string | null;
  description: string | null;
  isPinned: boolean;
  totalPageviews: number;
  commentCount: number;
  contentModifiedAt: string | null;
  category: PostCategory;
  tags: PostTag[];
  matchedComment?: MatchedComment;
}

export interface PostListItem extends PostBase {
  category: PostCategory;
}

export interface PostDetail extends PostBase {
  contentMd: string;
  category: PostDetailCategory;
}

export type SearchFilter =
  | "title_content"
  | "title"
  | "content"
  | "tag"
  | "category"
  | "comment";

export const SEARCH_FILTERS: SearchFilter[] = [
  "title_content",
  "title",
  "content",
  "tag",
  "category",
  "comment",
];

export interface PostNavigation {
  slug: string;
  title: string;
}

export interface PublishedPostSlug {
  slug: string;
  updatedAt: string;
}

export interface PublishedPostSlugsResponse {
  slugs: PublishedPostSlug[];
}

export interface PinnedPostCountResponse {
  pinnedCount: number;
}

export interface FetchPostsParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  tagSlug?: string;
  q?: string;
  filter?: SearchFilter;
}

export interface FetchAdminPostsParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  tagSlug?: string;
  q?: string;
  status?: "draft" | "published" | "archived";
  visibility?: "public" | "private";
  sort?: "published_at" | "created_at" | "totalPageviews" | "commentCount";
  order?: "asc" | "desc";
  includeDeleted?: boolean;
}

export interface BulkPostAction {
  ids: number[];
  action: "update" | "soft_delete" | "restore" | "hard_delete";
  categoryId?: number;
  commentStatus?: "open" | "locked" | "disabled";
  visibility?: "public" | "private";
}

export interface BulkPostErrorDetail {
  id: number;
  reason: string;
}

export interface PostDetailResponse {
  post: PostDetail;
}

export interface PostDetailWithNavigationResponse {
  post: PostDetail;
  prevPost: PostNavigation | null;
  nextPost: PostNavigation | null;
}

export interface CreatePostBody {
  title: string;
  contentMd: string;
  categoryId: number;
  thumbnailUrl?: string | null;
  visibility?: "public" | "private";
  status?: "draft" | "published" | "archived";
  commentStatus?: "open" | "locked" | "disabled";
  tags?: string[];
  summary?: string | null;
  description?: string | null;
  publishedAt?: string;
}

export type UpdatePostBody = Partial<CreatePostBody & { isPinned: boolean }>;
