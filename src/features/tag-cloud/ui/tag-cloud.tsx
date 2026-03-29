import Link from "next/link";
import type { Tag } from "@entities/tag";

const MAX_SIDEBAR_TAGS = 20;

interface TagCloudProps {
  tags: Tag[];
  showViewAllLink?: boolean;
}

export function TagCloud({ tags, showViewAllLink = true }: TagCloudProps) {
  const displayTags = tags.slice(0, MAX_SIDEBAR_TAGS);

  if (displayTags.length === 0) {
    return null;
  }

  return (
    <div>
      <ul className="flex flex-wrap gap-2" aria-label="태그 목록">
        {displayTags.map((tag) => (
          <li key={tag.id}>
            <Link
              href={`/tags/${tag.slug}`}
              className="inline-flex rounded-full border border-border-3 px-2.5 py-1 text-ui-xs font-medium text-text-3 transition-colors hover:border-primary-1 hover:bg-primary-1/5 hover:text-primary-1"
            >
              {tag.name}
            </Link>
          </li>
        ))}
      </ul>
      {showViewAllLink && (
        <Link
          href="/tags"
          className="mt-3 inline-flex items-center text-body-xs text-primary-1 hover:underline"
        >
          태그 전체보기 →
        </Link>
      )}
    </div>
  );
}
