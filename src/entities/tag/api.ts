import type { Tag } from "./model";
import { clientFetch, serverFetch } from "@shared/api";

interface TagsResponse {
  tags: Tag[];
}

export async function fetchTags(cookieHeader?: string): Promise<Tag[]> {
  const response = await serverFetch<TagsResponse>("/tags", {}, cookieHeader);

  return response.tags;
}

export async function fetchTagsClient(): Promise<Tag[]> {
  const response = await clientFetch<TagsResponse>("/tags");

  return response.tags;
}
