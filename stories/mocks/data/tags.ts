import type { Tag } from "@entities/tag";

export const mockTags: Tag[] = [
  { id: 1, name: "JavaScript", slug: "javascript", postCount: 8 },
  { id: 2, name: "TypeScript", slug: "typescript", postCount: 5 },
  { id: 3, name: "Next.js", slug: "nextjs", postCount: 3 },
];

export const mockActiveTag = mockTags[0];
