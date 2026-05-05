import type { Tag } from "./model";
import {
  clientFetch,
  publicServerFetch,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@shared/api";

interface TagsResponse {
  tags: Tag[];
}

export async function fetchTags(): Promise<Tag[]> {
  const response = await publicServerFetch<TagsResponse>("/tags", {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS.taxonomy,
  });

  return response.tags;
}

export async function fetchTagsClient(): Promise<Tag[]> {
  const response = await clientFetch<TagsResponse>("/tags");

  return response.tags;
}
