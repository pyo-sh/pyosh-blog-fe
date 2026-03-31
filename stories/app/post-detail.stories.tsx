import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import eyeLinear from "@iconify-icons/solar/eye-linear";
import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import Link from "next/link";
import { CommentList } from "@features/comment-section";
import { CodeBlockEnhancer } from "@features/post-detail/ui/code-block-enhancer";
import { RelatedPosts } from "@features/post-detail/ui/related-posts";
import type { Category } from "@entities/category";
import type { Comment, CommentListMeta } from "@entities/comment";
import type { Post } from "@entities/post";
import type { PopularPost, TotalViewsStats } from "@entities/stat";
import type { Tag } from "@entities/tag";
import {
  extractHeadings,
  renderMarkdown,
  type TocItem,
} from "@shared/lib/markdown";
import {
  PublicSidebarContent,
  PublicSidebarPanel,
} from "@widgets/public-sidebar";

const storyMarkdown = `# 소개

React Server Components(RSC)는 단순히 서버에서 렌더링된 HTML을 내려주는 기능이 아니라, **컴포넌트 경계를 설계하는 방식 자체를 바꾸는 도구**입니다.

이 글에서는 글 상세 와이어프레임 검토를 위해 본문, 관련 글, 댓글, TOC 영역이 모두 드러나는 샘플 콘텐츠를 사용합니다.

> 이 스토리는 Storybook 안에서 글 상세 디자인과 사이드바 구성을 동시에 검토하기 위한 mock 화면입니다.

# RSC란 무엇인가

RSC는 번들에 실리지 않는 서버 전용 컴포넌트를 만들 수 있게 해 줍니다. 덕분에 데이터 fetch와 렌더링 경계를 더 낮은 비용으로 나눌 수 있습니다.

## 서버와 클라이언트의 경계

가장 중요한 규칙은 \`"use client"\`를 정말 필요한 곳에만 두는 것입니다.

\`\`\`tsx
async function PostPage({ params }: Props) {
  const post = await fetchPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <PostContent html={post.html} />
      <LikeButton postId={post.id} />
    </article>
  );
}
\`\`\`

## 데이터 페칭 패턴

부모와 자식이 순차적으로 데이터를 기다리기 시작하면 워터폴이 생깁니다. 이런 구조는 article 페이지처럼 본문 아래에 관련 글과 댓글이 함께 붙는 화면에서 특히 체감됩니다.

### 직렬 vs 병렬 페칭

독립적인 데이터는 병렬로 가져오는 편이 낫습니다.

| 패턴 | 장점 | 단점 |
| --- | --- | --- |
| 직렬 페칭 | 단순함 | 느림 |
| Promise.all | 빠름 | 전체 실패 가능 |
| Promise.allSettled | 부분 성공 가능 | 예외 처리 복잡 |

## 컴포넌트 트리 설계

- 서버 컴포넌트를 가능한 한 높게 둡니다.
- 클라이언트 경계는 가능한 한 아래로 내립니다.
- 인터랙션이 필요한 최소 단위만 클라이언트로 분리합니다.

### 워터폴 방지

체감 성능은 작은 구조 차이에서 크게 갈립니다. 본문이 먼저 보여야 하는 글 상세에서는 특히 그렇습니다.

![RSC diagram](https://picsum.photos/seed/post-detail-story/800/420)

# 결론

결국 핵심은 **의도적으로 경계를 설계하는 것**입니다. 그렇게 해야 본문 가독성과 부가 섹션의 연결감을 함께 유지할 수 있습니다.
`;

const storyHeadings = extractHeadings(storyMarkdown);

const postDetailPost: Post = {
  id: 101,
  categoryId: 11,
  title:
    "React Server Components 실전 가이드 - 서버와 클라이언트의 경계를 설계하는 방법",
  slug: "react-server-components-practical-guide",
  contentMd: storyMarkdown,
  thumbnailUrl: "https://picsum.photos/seed/react-rsc-detail/960/540",
  visibility: "public",
  status: "published",
  commentStatus: "open",
  publishedAt: "2026-03-18T09:00:00.000Z",
  createdAt: "2026-03-17T08:00:00.000Z",
  updatedAt: "2026-03-18T09:00:00.000Z",
  deletedAt: null,
  summary: "React Server Components를 실전에 적용할 때 경계 설정과 데이터 페칭 패턴을 어떻게 판단할지 정리합니다.",
  description:
    "RSC를 단순히 사용하는 수준을 넘어, 서버와 클라이언트 경계를 어디에 둘지에 대한 실무적인 판단 기준을 정리했습니다.",
  isPinned: false,
  totalPageviews: 3847,
  commentCount: 12,
  contentModifiedAt: "2026-03-19T08:30:00.000Z",
  category: { id: 11, name: "React", slug: "react" },
  tags: [
    { id: 1, name: "React", slug: "react" },
    { id: 2, name: "RSC", slug: "rsc" },
    { id: 3, name: "Next.js", slug: "nextjs" },
    { id: 4, name: "Architecture", slug: "architecture" },
    { id: 5, name: "Performance", slug: "performance" },
  ],
};

const relatedPosts: Array<Pick<Post, "id" | "slug" | "title" | "thumbnailUrl">> =
  [
    {
      id: 201,
      slug: "typescript-pattern-matching-guide",
      title: "TypeScript 5.x 패턴 매칭 완전 정복",
      thumbnailUrl: "https://picsum.photos/seed/ts-pattern/360/225",
    },
    {
      id: 202,
      slug: "nextjs-cache-strategy",
      title: "Next.js App Router 캐싱 전략 A to Z",
      thumbnailUrl: "https://picsum.photos/seed/nextjs-cache/360/225",
    },
    {
      id: 203,
      slug: "zustand-jotai-comparison",
      title: "Zustand와 Jotai, 어떤 상태 관리가 맞을까",
      thumbnailUrl: "https://picsum.photos/seed/zustand-jotai/360/225",
    },
    {
      id: 204,
      slug: "container-queries-responsive-design",
      title: "Container Queries로 진짜 컴포넌트 기반 반응형 만들기",
      thumbnailUrl: "https://picsum.photos/seed/container-q/360/225",
    },
    {
      id: 205,
      slug: "vitest-mocking-patterns",
      title: "Vitest 모킹 패턴 8가지",
      thumbnailUrl: "https://picsum.photos/seed/vitest-mock/360/225",
    },
  ];

const pageOneComments: Comment[] = [
  {
    id: 1,
    postId: 101,
    parentId: null,
    depth: 0,
    body: "RSC 도입하면서 가장 헷갈렸던 경계 설정을 이 글에서 명확하게 정리해 주셨네요. 실무에 바로 적용하기 좋았습니다.",
    isSecret: false,
    status: "active",
    author: { type: "oauth", id: 1, name: "김민수" },
    replyToName: null,
    replies: [
      {
        id: 2,
        postId: 101,
        parentId: 1,
        depth: 1,
        body: "도움이 되셨다니 다행입니다. 특히 대시보드처럼 여러 데이터가 붙는 화면에서 차이가 큽니다.",
        isSecret: false,
        status: "active",
        author: { type: "oauth", id: 2, name: "pyosh" },
        replyToName: "김민수",
        replies: [],
        createdAt: "2026-03-19T07:00:00.000Z",
        updatedAt: "2026-03-19T07:00:00.000Z",
      },
      {
        id: 3,
        postId: 101,
        parentId: 1,
        depth: 1,
        body: "비공개 메시지입니다",
        isSecret: true,
        status: "active",
        author: { type: "guest", name: "익명" },
        replyToName: "pyosh",
        replies: [],
        createdAt: "2026-03-19T08:10:00.000Z",
        updatedAt: "2026-03-19T08:10:00.000Z",
      },
      {
        id: 4,
        postId: 101,
        parentId: 1,
        depth: 1,
        body: "워터폴 방지 부분이 특히 좋았습니다.",
        isSecret: false,
        status: "active",
        author: { type: "oauth", id: 3, name: "박지훈" },
        replyToName: "pyosh",
        replies: [],
        createdAt: "2026-03-19T08:40:00.000Z",
        updatedAt: "2026-03-19T08:40:00.000Z",
      },
    ],
    createdAt: "2026-03-19T06:30:00.000Z",
    updatedAt: "2026-03-19T06:30:00.000Z",
  },
  {
    id: 5,
    postId: 101,
    parentId: null,
    depth: 0,
    body: "서드파티 라이브러리 호환성 관련해서도 후속 글이 있으면 좋겠습니다.",
    isSecret: false,
    status: "active",
    author: { type: "guest", name: "이서연" },
    replyToName: null,
    replies: [],
    createdAt: "2026-03-18T13:20:00.000Z",
    updatedAt: "2026-03-18T13:20:00.000Z",
  },
  {
    id: 6,
    postId: 101,
    parentId: null,
    depth: 0,
    body: "",
    isSecret: false,
    status: "deleted",
    author: { type: "guest", name: "삭제된 사용자" },
    replyToName: null,
    replies: [
      {
        id: 7,
        postId: 101,
        parentId: 6,
        depth: 1,
        body: "원댓글이 삭제돼도 스레드 맥락은 남아 있어서 참고가 되네요.",
        isSecret: false,
        status: "active",
        author: { type: "oauth", id: 4, name: "정다은" },
        replyToName: null,
        replies: [],
        createdAt: "2026-03-18T15:00:00.000Z",
        updatedAt: "2026-03-18T15:00:00.000Z",
      },
    ],
    createdAt: "2026-03-18T14:10:00.000Z",
    updatedAt: "2026-03-18T14:10:00.000Z",
  },
];

const pageTwoComments: Comment[] = [
  {
    id: 8,
    postId: 101,
    parentId: null,
    depth: 0,
    body: "실제 프로젝트에서 어느 선까지 client component를 줄이는지 기준이 궁금합니다.",
    isSecret: false,
    status: "active",
    author: { type: "guest", name: "최유진" },
    replyToName: null,
    replies: [],
    createdAt: "2026-03-17T11:40:00.000Z",
    updatedAt: "2026-03-17T11:40:00.000Z",
  },
  {
    id: 9,
    postId: 101,
    parentId: null,
    depth: 0,
    body: "본문 타이포그래피가 정리돼서 훨씬 읽기 편합니다.",
    isSecret: false,
    status: "active",
    author: { type: "oauth", id: 5, name: "한지민" },
    replyToName: null,
    replies: [],
    createdAt: "2026-03-17T09:10:00.000Z",
    updatedAt: "2026-03-17T09:10:00.000Z",
  },
];

const commentMeta: CommentListMeta = {
  page: 1,
  limit: 10,
  totalCount: 9,
  totalRootComments: 5,
  totalPages: 2,
};

const recentPosts: Post[] = [
  postDetailPost,
  {
    ...postDetailPost,
    id: 111,
    slug: "nextjs-app-router-caching-a-to-z",
    title: "Next.js App Router 캐싱 전략 A to Z",
    publishedAt: "2026-03-17T09:00:00.000Z",
    createdAt: "2026-03-16T09:00:00.000Z",
    totalPageviews: 1923,
    commentCount: 4,
  },
  {
    ...postDetailPost,
    id: 112,
    slug: "container-queries-component-responsive",
    title: "Container Queries로 진짜 컴포넌트 기반 반응형 만들기",
    publishedAt: "2026-03-14T09:00:00.000Z",
    createdAt: "2026-03-13T09:00:00.000Z",
    totalPageviews: 1560,
    commentCount: 7,
  },
  {
    ...postDetailPost,
    id: 113,
    slug: "zustand-vs-jotai",
    title: "Zustand와 Jotai, 어떤 상태 관리가 맞을까",
    publishedAt: "2026-03-12T09:00:00.000Z",
    createdAt: "2026-03-11T09:00:00.000Z",
    totalPageviews: 1380,
    commentCount: 3,
  },
  {
    ...postDetailPost,
    id: 114,
    slug: "node-stream-backpressure",
    title: "Node.js Stream 백프레셔를 이해하면 보이는 것들",
    publishedAt: "2026-03-10T09:00:00.000Z",
    createdAt: "2026-03-09T09:00:00.000Z",
    totalPageviews: 1204,
    commentCount: 2,
  },
];

const popularPosts7Days: PopularPost[] = [
  {
    postId: 101,
    slug: postDetailPost.slug,
    title: postDetailPost.title,
    pageviews: 3847,
    uniques: 2641,
  },
  {
    postId: 202,
    slug: "nextjs-app-router-caching-a-to-z",
    title: "Next.js App Router 캐싱 전략 A to Z",
    pageviews: 1923,
    uniques: 1432,
  },
  {
    postId: 203,
    slug: "typescript-pattern-matching-guide",
    title: "TypeScript 5.x 패턴 매칭 완전 정복",
    pageviews: 1784,
    uniques: 1311,
  },
];

const popularPosts30Days: PopularPost[] = [
  ...popularPosts7Days,
  {
    postId: 204,
    slug: "docker-multistage-build-size-reduction",
    title: "Docker 멀티스테이지 빌드로 이미지 87% 감량",
    pageviews: 1658,
    uniques: 1204,
  },
  {
    postId: 205,
    slug: "vitest-mocking-patterns",
    title: "Vitest 모킹 패턴 8가지",
    pageviews: 1522,
    uniques: 1178,
  },
];

const categories: Category[] = [
  {
    id: 11,
    parentId: null,
    name: "Frontend",
    slug: "frontend",
    sortOrder: 1,
    isVisible: true,
    publishedPostCount: 23,
    totalPostCount: 23,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    children: [
      {
        id: 12,
        parentId: 11,
        name: "React",
        slug: "react",
        sortOrder: 1,
        isVisible: true,
        publishedPostCount: 12,
        totalPostCount: 12,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        children: [],
      },
      {
        id: 13,
        parentId: 11,
        name: "Next.js",
        slug: "nextjs",
        sortOrder: 2,
        isVisible: true,
        publishedPostCount: 6,
        totalPostCount: 6,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        children: [],
      },
    ],
  },
  {
    id: 21,
    parentId: null,
    name: "Backend",
    slug: "backend",
    sortOrder: 2,
    isVisible: true,
    publishedPostCount: 14,
    totalPostCount: 14,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    children: [],
  },
];

const tags: Tag[] = [
  { id: 1, name: "React", slug: "react", postCount: 12 },
  { id: 2, name: "Next.js", slug: "nextjs", postCount: 8 },
  { id: 3, name: "TypeScript", slug: "typescript", postCount: 7 },
  { id: 4, name: "Architecture", slug: "architecture", postCount: 4 },
  { id: 5, name: "Performance", slug: "performance", postCount: 5 },
  { id: 6, name: "Testing", slug: "testing", postCount: 3 },
];

const totalViews: TotalViewsStats = {
  totalPageviews: 128347,
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});

type LayoutMode = "main" | "desktop-sidebar" | "mobile-sidebar";

interface PostDetailStoryArgs {
  layoutMode: LayoutMode;
  commentStatus: "open" | "locked" | "disabled";
}

function formatDate(value: string | null, fallback: string) {
  return dateFormatter.format(new Date(value ?? fallback));
}

function StoryPostContent({ html }: { html: string }) {
  return (
    <CodeBlockEnhancer>
      <div
        className="markdown-content post-markdown prose max-w-none break-keep"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </CodeBlockEnhancer>
  );
}

function PostDetailMain({
  html,
  commentStatus,
}: {
  html: string;
  commentStatus: "open" | "locked" | "disabled";
}) {
  return (
    <main className="w-full pt-8 pb-16">
      <article className="motion-reveal">
        {postDetailPost.thumbnailUrl ? (
          <div className="mb-6 overflow-hidden rounded-[1.5rem] bg-background-3">
            <div className="relative aspect-[16/9] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- storybook mock surface */}
              <img
                src={postDetailPost.thumbnailUrl}
                alt={postDetailPost.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col">
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Link
                href={`/categories/${postDetailPost.category.slug}`}
                className="inline-flex items-center rounded-md bg-primary-1/12 px-2.5 py-1 text-ui-xs font-semibold text-primary-1 transition-colors hover:bg-primary-1/16"
              >
                {postDetailPost.category.name}
              </Link>
              <time
                dateTime={postDetailPost.publishedAt ?? postDetailPost.createdAt}
                className="text-ui-xs text-text-4"
              >
                {formatDate(postDetailPost.publishedAt, postDetailPost.createdAt)}
              </time>
              <span
                className="inline-flex items-center gap-1 text-ui-xs text-text-4"
                aria-label={`조회수 ${postDetailPost.totalPageviews.toLocaleString("ko-KR")}회`}
              >
                <Icon icon={eyeLinear} width="14" aria-hidden="true" />
                {postDetailPost.totalPageviews.toLocaleString("ko-KR")}
              </span>
            </div>

            <h1
              className="break-keep text-[1.5rem] leading-[1.95rem] tracking-tight text-text-1 md:text-h1"
              style={{ fontWeight: 700 }}
            >
              {postDetailPost.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {postDetailPost.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="inline-flex rounded-full border border-border-3 px-2.5 py-1 text-ui-xs font-medium text-text-3 transition-all duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary-1 hover:bg-primary-1/6 hover:text-primary-1"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </header>

          <StoryPostContent html={html} />

          <div className="mt-10">
            <RelatedPosts posts={relatedPosts} />
          </div>
        </div>
      </article>

      {commentStatus !== "disabled" ? (
        <CommentList
          postId={postDetailPost.id}
          initialComments={pageOneComments}
          initialMeta={commentMeta}
          viewer={{ type: "guest" }}
          initialError={null}
          commentStatus={commentStatus}
        />
      ) : (
        <section className="mt-12 border-t border-border-3 pt-8">
          <div className="rounded-[1rem] border border-dashed border-border-3 bg-background-2 px-5 py-8 text-center text-body-sm text-text-4">
            댓글이 비활성화된 글 상태를 미리 보는 스토리입니다.
          </div>
        </section>
      )}
    </main>
  );
}

function DesktopSidebarLayout({
  html,
  headings,
  commentStatus,
}: {
  html: string;
  headings: TocItem[];
  commentStatus: "open" | "locked" | "disabled";
}) {
  return (
    <div className="mx-auto flex w-full max-w-[67.5rem] gap-6 px-4 md:px-6">
      <aside
        aria-label="사이드바"
        className="hidden w-[210px] shrink-0 lg:block"
      >
        <div className="pr-6 pt-8 pb-16">
          <PublicSidebarContent
            recentPosts={recentPosts}
            popularPosts={popularPosts7Days}
            categories={categories}
            tags={tags}
            totalViews={totalViews}
            headings={headings}
          />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <PostDetailMain html={html} commentStatus={commentStatus} />
      </div>
    </div>
  );
}

function MobileSidebarLayout({ headings }: { headings: TocItem[] }) {
  return (
    <div className="mx-auto w-[375px] bg-black/5 p-4">
      <div className="overflow-hidden bg-background-1 shadow-[-4px_0_24px_rgba(0,0,0,0.1)]">
        <PublicSidebarPanel
          recentPosts={recentPosts}
          popularPosts={popularPosts7Days}
          categories={categories}
          tags={tags}
          totalViews={totalViews}
          headings={headings}
          onClose={() => undefined}
        />
      </div>
    </div>
  );
}

function MainOnlyLayout({
  html,
  commentStatus,
  mobile = false,
}: {
  html: string;
  commentStatus: "open" | "locked" | "disabled";
  mobile?: boolean;
}) {
  return (
    <div
      className={
        mobile
          ? "mx-auto w-[375px] px-4"
          : "mx-auto w-full max-w-[56rem] px-4 md:px-6"
      }
    >
      <PostDetailMain html={html} commentStatus={commentStatus} />
    </div>
  );
}

function StorySurface({
  children,
  mobile = false,
}: {
  children: ReactNode;
  mobile?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background-1">
      {mobile ? (
        <div className="mx-auto max-w-[430px] py-6">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

const postDetailHandlers = [
  http.get("/api/stats/popular", ({ request }) => {
    const url = new URL(request.url);
    const days = url.searchParams.get("days");

    return HttpResponse.json({
      data: days === "30" ? popularPosts30Days : popularPosts7Days,
    });
  }),
  http.get("/api/posts/:postId/comments", ({ request, params }) => {
    if (Number(params.postId) !== postDetailPost.id) {
      return HttpResponse.json({ data: [], meta: commentMeta });
    }

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");

    return HttpResponse.json({
      data: page <= 1 ? pageOneComments : pageTwoComments,
      meta: {
        ...commentMeta,
        page,
        totalCount: 9,
        totalRootComments: 5,
        totalPages: 2,
      },
    });
  }),
  http.post("/api/posts/:postId/comments", async ({ request, params }) => {
    if (Number(params.postId) !== postDetailPost.id) {
      return HttpResponse.json(
        { message: "post not found" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      body?: string;
      guestName?: string;
      isSecret?: boolean;
      parentId?: number;
      replyToCommentId?: number;
    };

    const nextId = 999;

    return HttpResponse.json({
      data: {
        id: nextId,
        postId: postDetailPost.id,
        parentId: body.parentId ?? null,
        depth: body.parentId ? 1 : 0,
        body: body.isSecret ? "비공개 메시지입니다" : (body.body ?? ""),
        isSecret: Boolean(body.isSecret),
        status: "active",
        author: {
          type: "guest",
          name: body.guestName?.trim() || "Storybook Guest",
        },
        replyToName: body.replyToCommentId ? "김민수" : null,
        replies: [],
        createdAt: "2026-03-20T09:00:00.000Z",
        updatedAt: "2026-03-20T09:00:00.000Z",
      },
      revealToken: body.isSecret ? "storybook-token" : null,
    });
  }),
  http.post("/api/comments/:commentId/reveal", ({ params }) => {
    return HttpResponse.json({
      data: {
        id: Number(params.commentId),
        postId: postDetailPost.id,
        parentId: 1,
        depth: 1,
        body: "스토리북에서 확인하는 비밀 댓글 원문입니다.",
        isSecret: true,
        status: "active",
        author: { type: "guest", name: "익명" },
        replyToName: "pyosh",
        replies: [],
        createdAt: "2026-03-19T08:10:00.000Z",
        updatedAt: "2026-03-19T08:10:00.000Z",
      },
    });
  }),
  http.delete("/api/comments/:commentId", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

const meta: Meta<PostDetailStoryArgs> = {
  title: "App/PostDetail",
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: `/posts/${postDetailPost.slug}`,
        query: {},
      },
    },
    msw: {
      handlers: postDetailHandlers,
    },
  },
  args: {
    layoutMode: "main",
    commentStatus: "open",
  },
  loaders: [
    async () => ({
      html: await renderMarkdown(postDetailPost.contentMd),
      headings: storyHeadings,
    }),
  ],
  render: (args, { loaded }) => {
    const html = loaded.html as string;
    const headings = loaded.headings as TocItem[];

    if (args.layoutMode === "desktop-sidebar") {
      return (
        <StorySurface>
          <DesktopSidebarLayout
            html={html}
            headings={headings}
            commentStatus={args.commentStatus}
          />
        </StorySurface>
      );
    }

    if (args.layoutMode === "mobile-sidebar") {
      return (
        <StorySurface mobile>
          <MobileSidebarLayout headings={headings} />
        </StorySurface>
      );
    }

    return (
      <StorySurface mobile={args.layoutMode === "main" ? false : true}>
        <MainOnlyLayout
          html={html}
          commentStatus={args.commentStatus}
          mobile={false}
        />
      </StorySurface>
    );
  },
};

export default meta;

type Story = StoryObj<PostDetailStoryArgs>;

export const MainOnly: Story = {
  args: {
    layoutMode: "main",
    commentStatus: "open",
  },
};

export const WithSidebar: Story = {
  args: {
    layoutMode: "desktop-sidebar",
    commentStatus: "open",
  },
};

export const MobileMain: Story = {
  args: {
    layoutMode: "main",
    commentStatus: "open",
  },
  render: (args, { loaded }) => (
    <StorySurface mobile>
      <MainOnlyLayout
        html={loaded.html as string}
        commentStatus={args.commentStatus}
        mobile
      />
    </StorySurface>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const MobileSidebarPanel: Story = {
  args: {
    layoutMode: "mobile-sidebar",
    commentStatus: "open",
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const LockedComments: Story = {
  args: {
    layoutMode: "desktop-sidebar",
    commentStatus: "locked",
  },
};

export const DisabledComments: Story = {
  args: {
    layoutMode: "desktop-sidebar",
    commentStatus: "disabled",
  },
};
