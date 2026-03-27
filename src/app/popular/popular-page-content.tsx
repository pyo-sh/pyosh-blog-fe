import Link from "next/link";
import type { PopularPost } from "@entities/stat";
import { EmptyState } from "@shared/ui/libs";

interface PopularPageContentProps {
  days: 7 | 30;
  posts: PopularPost[];
}

const PERIOD_OPTIONS = [
  { days: 7, label: "7일" },
  { days: 30, label: "30일" },
] as const;

export function PopularPageContent({ days, posts }: PopularPageContentProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Popular Posts
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">인기 글</h1>
        <p className="mt-4 max-w-2xl text-body-md text-text-3">
          최근 {days}일 동안 가장 많이 읽힌 글을 모아봤습니다.
        </p>

        <nav
          aria-label="인기 글 기간 선택"
          className="mt-6 inline-flex w-fit rounded-full border border-border-3 bg-background-1 p-1"
        >
          {PERIOD_OPTIONS.map((option) => {
            const isActive = option.days === days;

            return (
              <Link
                key={option.days}
                href={`/popular?days=${option.days}`}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-full px-4 py-2 text-body-sm font-medium transition-colors",
                  isActive
                    ? "bg-background-3 text-text-1"
                    : "text-text-3 hover:text-text-1",
                ].join(" ")}
              >
                {option.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {posts.length > 0 ? (
        <ol className="grid gap-4">
          {posts.map((post, index) => (
            <li key={post.postId}>
              <Link
                href={`/posts/${post.slug}`}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-border-3 bg-background-1 p-6 transition-colors hover:border-border-2 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-2 text-body-md font-semibold text-text-2">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-body-lg font-semibold text-text-1">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-body-sm text-text-3">
                      {post.pageviews.toLocaleString("ko-KR")} views
                    </p>
                  </div>
                </div>

                <dl className="flex gap-6 text-body-sm text-text-3">
                  <div>
                    <dt className="text-body-xs uppercase tracking-[0.18em] text-text-4">
                      Pageviews
                    </dt>
                    <dd className="mt-1 text-body-md font-semibold text-text-1">
                      {post.pageviews.toLocaleString("ko-KR")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-body-xs uppercase tracking-[0.18em] text-text-4">
                      Visitors
                    </dt>
                    <dd className="mt-1 text-body-md font-semibold text-text-1">
                      {post.uniques.toLocaleString("ko-KR")}
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState variant="page" message="아직 집계된 인기 글이 없습니다." />
      )}
    </main>
  );
}
