import type { PostDetail } from "@entities/post";

export interface PostFormValues {
  title: string;
  categoryId: number | null;
  tags: string[];
  status: PostDetail["status"];
  visibility: PostDetail["visibility"];
  commentStatus: "open" | "locked" | "disabled";
  thumbnailUrl: string;
  summary: string;
  description: string;
  contentMd: string;
}

export function mapPostToFormValues(post: PostDetail): PostFormValues {
  return {
    title: post.title,
    categoryId: post.categoryId,
    tags: post.tags.map((tag) => tag.name),
    status: post.status,
    visibility: post.visibility,
    commentStatus: post.commentStatus ?? "open",
    thumbnailUrl: post.thumbnailUrl ?? "",
    summary: post.summary ?? "",
    description: post.description ?? "",
    contentMd: post.contentMd,
  };
}
