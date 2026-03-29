"use client";

import { Suspense } from "react";
import { Icon } from "@iconify/react";
import documentTextLinear from "@iconify-icons/solar/document-text-linear";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PostListItem } from "./post-list-item";
import { PostListItemSkeleton } from "./post-list-item-skeleton";
import type { Post } from "@entities/post";
import type { PaginatedResponse } from "@shared/api";
import { fetchPosts } from "@entities/post";
import { Pagination } from "@shared/ui/libs";

interface PostListProps {
  initialData: PaginatedResponse<Post>;
  initialPage: number;
  basePath?: string;
}

const SKELETON_COUNT = 10;

function PostListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <PostListItemSkeleton key={i} />
      ))}
    </div>
  );
}

function PostListEmptyState() {
  return (
    <section
      className="motion-reveal rounded-[2rem] border-2 border-dashed border-border-3 bg-background-2 px-8 py-16 text-center"
      style={{ animationDelay: "160ms" }}
    >
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-3 text-text-4">
          <Icon icon={documentTextLinear} width="28" aria-hidden="true" />
        </div>
      </div>
      <p className="mb-1 break-keep text-body-base font-medium text-text-2">
        아직 등록된 공개 글이 없습니다.
      </p>
      <p className="text-body-sm text-text-4">곧 새로운 글로 찾아올게요.</p>
    </section>
  );
}

function PostListErrorState() {
  return (
    <section
      className="motion-reveal rounded-[2rem] border-2 border-dashed border-border-3 bg-background-2 px-8 py-16 text-center"
      style={{ animationDelay: "160ms" }}
    >
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-3 text-text-4">
          <Icon icon={documentTextLinear} width="28" aria-hidden="true" />
        </div>
      </div>
      <p className="mb-1 break-keep text-body-base font-medium text-text-2">
        최근 글을 불러오는데 오류가 발생했습니다.
      </p>
      <p className="text-body-sm text-text-4">잠시 후 다시 시도해 주세요.</p>
    </section>
  );
}

function PostListInner({
  initialData,
  initialPage,
  basePath = "/",
}: PostListProps) {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = Math.max(1, Number(pageParam) || 1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", basePath, page],
    queryFn: () => fetchPosts({ page }),
    initialData: page === initialPage ? initialData : undefined,
    staleTime: 30_000,
  });

  if (isLoading) {
    return <PostListSkeleton />;
  }

  if (isError) {
    return <PostListErrorState />;
  }

  const posts = data?.data ?? [];
  const meta = data?.meta;
  const pinnedPosts = posts.filter((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);

  return (
    <>
      {posts.length === 0 ? (
        <PostListEmptyState />
      ) : (
        <div>
          {pinnedPosts.length > 0 ? (
            <section
              aria-label="고정된 글"
              className="motion-reveal mb-2"
              style={{ animationDelay: "180ms" }}
            >
              <div className="grid gap-3">
                {pinnedPosts.map((post) => (
                  <PostListItem key={post.id} post={post} />
                ))}
              </div>
            </section>
          ) : null}

          {pinnedPosts.length > 0 && regularPosts.length > 0 ? (
            <div
              className="motion-reveal mx-4 mb-2 sm:mx-5"
              style={{ animationDelay: "220ms" }}
              aria-hidden="true"
            >
              <div className="h-px bg-border-3" />
            </div>
          ) : null}

          <section
            aria-label="글 목록"
            className="motion-reveal"
            style={{
              animationDelay: pinnedPosts.length > 0 ? "260ms" : "180ms",
            }}
          >
            <div className="grid gap-3">
              {regularPosts.map((post) => (
                <PostListItem key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>
      )}

      {meta && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          basePath={basePath}
        />
      )}
    </>
  );
}

export function PostList(props: PostListProps) {
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostListInner {...props} />
    </Suspense>
  );
}
