"use client";

import type { PostDetail } from "@entities/post";
import { normalizeAssetUrl } from "@shared/lib/asset-url";

interface PostCardPreviewProps {
  title: string;
  categoryName: string;
  tags: string[];
  thumbnailUrl: string;
  summary: string;
  visibility: PostDetail["visibility"];
  status: PostDetail["status"];
  compact?: boolean;
}

export function PostCardPreview({
  title,
  categoryName,
  tags,
  thumbnailUrl,
  summary,
  visibility,
  status,
  compact = false,
}: PostCardPreviewProps) {
  const effectiveSummary = summary.trim();
  const displayThumbnailUrl = thumbnailUrl
    ? normalizeAssetUrl(thumbnailUrl)
    : thumbnailUrl;
  const statusLabel =
    status === "published" ? "발행" : status === "archived" ? "보관" : "작성중";

  return (
    <>
      {compact ? (
        <div className="overflow-hidden rounded-[1rem] border border-border-3 bg-background-1">
          <div className="overflow-hidden bg-background-3">
            {displayThumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin preview URLs are allowed
              <img
                src={displayThumbnailUrl}
                alt={title || "썸네일 미리보기"}
                className="aspect-[8/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[8/5] w-full items-center justify-center text-sm text-text-4">
                썸네일 미리보기
              </div>
            )}
          </div>

          <div className="space-y-2 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-1">
              {categoryName || "카테고리"}
            </div>
            <div className="line-clamp-2 text-sm font-semibold leading-6 text-text-1">
              {title || "글 제목이 여기에 표시됩니다."}
            </div>
            <div className="text-xs text-text-4">
              {visibility === "public" ? "공개" : "비공개"} · {statusLabel}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[1rem] border border-border-3 bg-background-1 p-4">
          <div className="flex gap-4">
            <div className="w-[11rem] shrink-0 overflow-hidden rounded-[0.9rem] bg-background-3">
              {displayThumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin preview URLs are allowed
                <img
                  src={displayThumbnailUrl}
                  alt={title || "썸네일 미리보기"}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-text-4">
                  썸네일
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-4">
                <span className="rounded-md bg-primary-1/10 px-2.5 py-1 font-semibold text-primary-1">
                  {categoryName || "카테고리"}
                </span>
                <span>2026. 3. 25.</span>
              </div>

              <h3 className="line-clamp-2 text-base font-semibold leading-6 text-text-1">
                {title || "글 제목이 여기에 표시됩니다."}
              </h3>

              <p className="line-clamp-2 text-sm leading-6 text-text-3">
                {effectiveSummary ||
                  "summary를 입력하면 글 목록 카드에 반영됩니다."}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-text-4">
                <span>{visibility === "public" ? "공개" : "비공개"}</span>
                <span>{statusLabel}</span>
                <span>조회수 1,234</span>
                <span>댓글 8</span>
              </div>

              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-3 px-2.5 py-1 text-[11px] text-text-4"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
