import type { AdminCommentItem } from "@entities/comment";
import type { PaginatedResponse } from "@shared/api";

export const mockAdminComments: AdminCommentItem[] = [
  {
    id: 1,
    postId: 101,
    parentId: null,
    depth: 0,
    body: "이 글 덕분에 RSC 개념이 확실히 잡혔습니다. 특히 서버 컴포넌트와 클라이언트 컴포넌트의 경계 설명이 좋았습니다.",
    isSecret: false,
    status: "active",
    author: { type: "guest", name: "김지훈" },
    replyToName: null,
    post: { id: 101, title: "React Server Components 실전 가이드" },
    createdAt: "2026-03-31T06:00:00.000Z",
    updatedAt: "2026-03-31T06:00:00.000Z",
  },
  {
    id: 2,
    postId: 102,
    parentId: null,
    depth: 0,
    body: "혹시 Zustand에서 미들웨어 활용하는 예제도 다뤄주실 수 있나요? persist 미들웨어가 조금 헷갈립니다.",
    isSecret: false,
    status: "active",
    author: { type: "oauth", name: "박소영" },
    replyToName: null,
    post: { id: 102, title: "Zustand와 Jotai, 어떤 상태 관리가 맞을까" },
    createdAt: "2026-03-31T04:00:00.000Z",
    updatedAt: "2026-03-31T04:00:00.000Z",
  },
  {
    id: 3,
    postId: 103,
    parentId: 1,
    depth: 1,
    body: "컨테이너 쿼리를 실무에 도입하려는데 브라우저 지원 범위가 아직 걸리는 부분이 있어서요.",
    isSecret: false,
    status: "active",
    author: { type: "guest", name: "이준혁" },
    replyToName: "김지훈",
    post: {
      id: 103,
      title: "Container Queries로 진짜 컴포넌트 기반 반응형 만들기",
    },
    createdAt: "2026-03-31T01:00:00.000Z",
    updatedAt: "2026-03-31T01:00:00.000Z",
  },
  {
    id: 4,
    postId: 104,
    parentId: null,
    depth: 0,
    body: "Docker 멀티스테이지 빌드 적용했더니 진짜 이미지 크기가 확 줄었어요. 감사합니다.",
    isSecret: false,
    status: "active",
    author: { type: "oauth", name: "최민서" },
    replyToName: null,
    post: {
      id: 104,
      title: "Docker 멀티스테이지 빌드로 이미지 크기를 87% 줄인 이야기",
    },
    createdAt: "2026-03-30T03:00:00.000Z",
    updatedAt: "2026-03-30T03:00:00.000Z",
  },
  {
    id: 5,
    postId: 105,
    parentId: null,
    depth: 0,
    body: "비밀 댓글입니다 - 관리자에게만 원문이 보입니다.",
    isSecret: true,
    status: "active",
    author: { type: "guest", name: "한도윤" },
    replyToName: null,
    post: {
      id: 105,
      title: "Node.js Stream 백프레셔를 이해하면 보이는 것들",
    },
    createdAt: "2026-03-29T03:00:00.000Z",
    updatedAt: "2026-03-29T03:00:00.000Z",
  },
];

export const mockAdminCommentsResponse: PaginatedResponse<AdminCommentItem> = {
  data: mockAdminComments,
  meta: {
    page: 1,
    limit: 5,
    total: 127,
    totalPages: 26,
  },
};

export const mockAdminCommentThreadResponses: Record<
  number,
  {
    parent: AdminCommentItem;
    replies: AdminCommentItem[];
  }
> = {
  1: {
    parent: mockAdminComments[0],
    replies: [
      mockAdminComments[2],
      {
        id: 6,
        postId: 101,
        parentId: 1,
        depth: 1,
        body: "관련 글도 기대하겠습니다. 실제 운영 환경에서의 적용기까지 보면 더 좋을 것 같아요.",
        isSecret: false,
        status: "active",
        author: { type: "oauth", name: "정예린" },
        replyToName: "김지훈",
        post: { id: 101, title: "React Server Components 실전 가이드" },
        createdAt: "2026-03-31T02:30:00.000Z",
        updatedAt: "2026-03-31T02:30:00.000Z",
      },
    ],
  },
  3: {
    parent: mockAdminComments[0],
    replies: [
      mockAdminComments[2],
      {
        id: 6,
        postId: 101,
        parentId: 1,
        depth: 1,
        body: "관련 글도 기대하겠습니다. 실제 운영 환경에서의 적용기까지 보면 더 좋을 것 같아요.",
        isSecret: false,
        status: "active",
        author: { type: "oauth", name: "정예린" },
        replyToName: "김지훈",
        post: { id: 101, title: "React Server Components 실전 가이드" },
        createdAt: "2026-03-31T02:30:00.000Z",
        updatedAt: "2026-03-31T02:30:00.000Z",
      },
    ],
  },
};
