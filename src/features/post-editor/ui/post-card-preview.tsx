"use client";

import { extractPlainText } from "../lib/extract-plain-text";
import type { Post } from "@entities/post";

interface PostCardPreviewProps {
  title: string;
  categoryName: string;
  tags: string[];
  thumbnailUrl: string;
  summary: string;
  contentMd: string;
  visibility: Post["visibility"];
  status: Post["status"];
}

export function PostCardPreview({
  title,
  categoryName,
  tags,
  thumbnailUrl,
  summary,
  contentMd,
  visibility,
  status,
}: PostCardPreviewProps) {
  const effectiveSummary = summary.trim() || extractPlainText(contentMd, 160);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-1">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin preview URLs are allowed
        <img
          src={thumbnailUrl}
          alt={title || "썸네일 미리보기"}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-background-3 text-sm text-text-4">
          썸네일 미리보기
        </div>
      )}

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-4">
          <span className="rounded-full bg-background-2 px-3 py-1 text-text-3">
            {categoryName || "카테고리"}
          </span>
          <span>{visibility === "public" ? "공개" : "비공개"}</span>
          <span>
            {status === "published"
              ? "발행"
              : status === "archived"
                ? "보관"
                : "초안"}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-1">
            {title || "글 제목이 여기에 표시됩니다."}
          </h3>
          <p className="text-sm leading-6 text-text-3">
            {effectiveSummary ||
              "summary를 입력하면 글 목록 카드에 반영됩니다."}
          </p>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-3 px-3 py-1 text-xs text-text-4"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
