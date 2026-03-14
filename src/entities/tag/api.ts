import type { Tag } from "./model";
import { serverFetch } from "@shared/api";

interface TagsResponse {
  tags: Tag[];
}

export async function fetchTags(cookieHeader?: string): Promise<Tag[]> {
  const response = await serverFetch<TagsResponse>(
    "/api/tags",
    {},
    cookieHeader,
  );

  return response.tags;
}
