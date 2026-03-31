import type { Meta, StoryObj } from "@storybook/react";
import {
  SearchEmptyState,
  SearchForm,
  SearchResultItem,
} from "@features/search";
import type { Post } from "@entities/post";

type SearchStoryArgs = {
  currentFilter: "title_content" | "title" | "content" | "tag" | "category" | "comment";
  initialQuery: string;
  resultsTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: "search" | "search-zoom-in";
  posts: Post[];
  mobile?: boolean;
};

const storyMeta: Meta<SearchStoryArgs> = {
  title: "App/Search",
  parameters: {
    layout: "fullscreen",
  },
  args: {
    currentFilter: "title_content",
    initialQuery: "JavaScript",
    resultsTitle: '"JavaScript" 검색 결과 (3건)',
    emptyTitle: "검색 결과가 없습니다",
    emptyDescription: "다른 검색어나 필터로 다시 시도해 보세요",
    emptyIcon: "search-zoom-in",
    posts: [],
  },
};

export default storyMeta;
type Story = StoryObj<SearchStoryArgs>;

const basePost: Post = {
  id: 301,
  categoryId: 10,
  title: "React Server Components와 JavaScript 번들 최적화",
  slug: "react-server-components-javascript-bundle",
  contentMd: "# React Server Components",
  thumbnailUrl: "https://picsum.photos/seed/react-rsc/256/192",
  visibility: "public",
  status: "published",
  commentStatus: "open",
  publishedAt: "2026-03-18T09:00:00.000Z",
  createdAt: "2026-03-17T09:00:00.000Z",
  updatedAt: "2026-03-18T09:00:00.000Z",
  deletedAt: null,
  summary:
    "RSC를 활용하면 클라이언트로 전송되는 JavaScript 번들 크기를 줄이고 초기 렌더 비용을 낮출 수 있습니다.",
  description: "RSC와 번들 최적화 개요",
  isPinned: false,
  totalPageviews: 3847,
  commentCount: 24,
  contentModifiedAt: "2026-03-18T09:00:00.000Z",
  category: {
    id: 10,
    name: "React",
    slug: "react",
  },
  tags: [
    { id: 1, name: "React", slug: "react" },
    { id: 2, name: "JavaScript", slug: "javascript" },
  ],
};

const resultPosts: Post[] = [
  basePost,
  {
    ...basePost,
    id: 302,
    title: "Vanilla JavaScript로 다시 보는 DOM 조작의 기본",
    slug: "vanilla-javascript-dom-basics",
    thumbnailUrl: null,
    publishedAt: "2026-03-10T09:00:00.000Z",
    createdAt: "2026-03-09T09:00:00.000Z",
    updatedAt: "2026-03-10T09:00:00.000Z",
    totalPageviews: 1562,
    commentCount: 9,
    category: {
      id: 11,
      name: "Frontend",
      slug: "frontend",
    },
    summary:
      "프레임워크 없이 순수 JavaScript만으로 동적 UI를 구현하면서 배우는 DOM API의 핵심 개념과 성능 최적화 기법.",
  },
  {
    ...basePost,
    id: 303,
    title: "Node.js 이벤트 루프 완전 정복",
    slug: "nodejs-event-loop-deep-dive",
    publishedAt: "2026-02-15T09:00:00.000Z",
    createdAt: "2026-02-14T09:00:00.000Z",
    updatedAt: "2026-02-15T09:00:00.000Z",
    totalPageviews: 987,
    commentCount: 14,
    category: {
      id: 12,
      name: "Node.js",
      slug: "nodejs",
    },
    summary:
      "이벤트 루프의 각 페이즈를 이해하면 비동기 코드의 실행 순서를 예측할 수 있습니다.",
    matchedComment: {
      authorName: "유진",
      body: "JavaScript 런타임의 이벤트 루프를 이해하고 나니 콜백 지옥을 훨씬 명확하게 디버깅할 수 있었습니다.",
    },
  },
];

function SearchStoryFrame({
  currentFilter,
  initialQuery,
  resultsTitle,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  posts,
  mobile = false,
}: SearchStoryArgs) {
  const content = (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[67.5rem] flex-col gap-6 px-4 pb-16 pt-8 md:px-6">
      <SearchForm currentFilter={currentFilter} initialQuery={initialQuery} />

      {resultsTitle ? (
        <header className="text-ui-base font-semibold text-text-2">
          {renderResultsTitle(resultsTitle)}
        </header>
      ) : null}

      {posts.length > 0 ? (
        <section aria-label="검색 결과">
          {posts.map((post) => (
            <SearchResultItem key={post.id} post={post} query={initialQuery} />
          ))}
        </section>
      ) : (
        <SearchEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </main>
  );

  if (mobile) {
    return (
      <div className="mx-auto w-full max-w-[25.4375rem] px-4 py-4">
        <div className="overflow-hidden rounded-[1.5rem] border border-border-3 bg-background-1 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.08)]">
          {content}
        </div>
      </div>
    );
  }

  return (
    content
  );
}

function renderResultsTitle(title: string) {
  const match = title.match(/^"(.+)" 검색 결과 \((\d+)건\)$/);

  if (!match) {
    return title;
  }

  const [, query, count] = match;

  return (
    <>
      <span className="font-bold text-primary-1">&quot;{query}&quot;</span>{" "}
      검색 결과 <span className="font-normal text-text-3">({count}건)</span>
    </>
  );
}

export const Results: Story = {
  render: (args) => <SearchStoryFrame {...args} />,
  args: {
    posts: resultPosts,
    resultsTitle: '"JavaScript" 검색 결과 (3건)',
  },
};

export const EmptyResults: Story = {
  render: (args) => <SearchStoryFrame {...args} />,
  args: {
    initialQuery: "Rust",
    resultsTitle: '"Rust" 검색 결과 (0건)',
    emptyTitle: "검색 결과가 없습니다",
    emptyDescription: "다른 검색어나 필터로 다시 시도해 보세요",
    emptyIcon: "search-zoom-in",
    posts: [],
  },
};

export const EmptyQuery: Story = {
  render: (args) => <SearchStoryFrame {...args} />,
  args: {
    initialQuery: "",
    resultsTitle: "",
    emptyTitle: "검색어를 입력해 주세요",
    emptyDescription: "제목, 내용, 태그, 카테고리, 댓글로 검색할 수 있습니다",
    emptyIcon: "search",
    posts: [],
  },
};

export const Mobile: Story = {
  render: (args) => <SearchStoryFrame {...args} mobile />,
  args: {
    posts: resultPosts,
    resultsTitle: '"JavaScript" 검색 결과 (3건)',
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const DarkMode: Story = {
  render: (args) => <SearchStoryFrame {...args} />,
  args: {
    posts: resultPosts,
    resultsTitle: '"JavaScript" 검색 결과 (3건)',
  },
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
