"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PostListItem } from "./post-list-item";
import { PostListItemSkeleton } from "./post-list-item-skeleton";
import type { Post } from "@entities/post";
import type { PaginatedResponse } from "@shared/api";
import { fetchPosts } from "@entities/post";
import { EmptyState, Pagination } from "@shared/ui/libs";

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
    return (
      <section className="rounded-2xl border border-dashed border-border-3 bg-background-2 p-8 text-sm text-text-3 md:p-10">
        게시글을 불러오는 중 오류가 발생했습니다
      </section>
    );
  }

  const posts = data?.data ?? [];
  const meta = data?.meta;
  const pinnedPosts = posts.filter((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);

  return (
    <>
      {posts.length === 0 ? (
        <EmptyState variant="page" message="찾으시는 게시물은 없습니다." />
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
