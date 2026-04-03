import type { Meta, StoryObj } from "@storybook/react";
import { CommentList } from "@features/comment-section";
import { mockComments, mockCommentMeta } from "../mocks/data/comments";

const meta: Meta<typeof CommentList> = {
  title: "Features/Public/CommentSection/CommentList",
  component: CommentList,
  parameters: {
    layout: "padded",
  },
  args: {
    postId: 1,
    initialComments: mockComments,
    initialMeta: mockCommentMeta,
    viewer: {
      type: "oauth",
      id: 1,
    },
    initialError: null,
    commentStatus: "open",
  },
};

export default meta;
type Story = StoryObj<typeof CommentList>;

export const Default: Story = {};

export const Locked: Story = {
  args: {
    commentStatus: "locked",
  },
};

export const Empty: Story = {
  args: {
    initialComments: [],
    initialMeta: {
      page: 1,
      limit: 10,
      totalCount: 0,
      totalRootComments: 0,
      totalPages: 1,
    },
  },
};

export const GuestViewer: Story = {
  args: {
    viewer: {
      type: "guest",
    },
  },
};
