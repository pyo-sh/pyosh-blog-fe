import type { GuestbookEntry } from "@entities/guestbook";

export const mockGuestbookEntries: GuestbookEntry[] = [
  {
    id: 1,
    parentId: null,
    body: "블로그 정말 잘 보고 있습니다. 앞으로도 좋은 글 부탁드려요!",
    isSecret: false,
    status: "active",
    author: {
      type: "oauth",
      id: 1,
      name: "박영희",
      avatarUrl: undefined,
    },
    replies: [],
    createdAt: "2026-02-10T12:00:00.000Z",
    updatedAt: "2026-02-10T12:00:00.000Z",
  },
  {
    id: 2,
    parentId: null,
    body: "Next.js 글 덕분에 많이 배웠습니다. 감사합니다!",
    isSecret: false,
    status: "active",
    author: {
      type: "guest",
      name: "개발자A",
      email: "dev-a@example.com",
    },
    replies: [],
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-02-15T09:00:00.000Z",
  },
];
