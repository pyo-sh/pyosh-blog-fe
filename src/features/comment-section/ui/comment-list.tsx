"use client";

import { useEffect, useState } from "react";
import { CommentForm, type GuestCommentProfile } from "./comment-form";
import { CommentItem } from "./comment-item";
import type {
  Comment,
  CreateCommentGuestBody,
  CreateCommentOAuthBody,
} from "@entities/comment";
import { createComment, deleteComment } from "@entities/comment";
import { Modal } from "@shared/ui/libs";

interface CommentViewer {
  type: "guest" | "oauth";
  id?: number;
}

interface CommentListProps {
  postId: number;
  initialComments: Comment[];
  viewer: CommentViewer;
}

function appendComment(comments: Comment[], nextComment: Comment): Comment[] {
  if (nextComment.parentId === null) {
    return [...comments, nextComment];
  }

  return comments.map((comment) => {
    if (comment.id === nextComment.parentId) {
      return {
        ...comment,
        replies: [...comment.replies, nextComment],
      };
    }

    return {
      ...comment,
      replies: appendComment(comment.replies, nextComment),
    };
  });
}

function markCommentDeleted(comments: Comment[], commentId: number): Comment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        status: "deleted",
        body: "",
      };
    }

    return {
      ...comment,
      replies: markCommentDeleted(comment.replies, commentId),
    };
  });
}

export function CommentList({
  postId,
  initialComments,
  viewer,
}: CommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [profile, setProfile] = useState<GuestCommentProfile>({
    guestName: "",
    guestEmail: "",
    guestPassword: "",
  });

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  function handleProfileChange(
    field: keyof GuestCommentProfile,
    value: string,
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreate(
    payload: CreateCommentGuestBody | CreateCommentOAuthBody,
  ) {
    const nextComment = await createComment(postId, payload);
    setComments((current) => appendComment(current, nextComment));
    setReplyTarget(null);
  }

  function canDeleteComment(comment: Comment) {
    if (comment.status === "deleted") {
      return false;
    }

    if (comment.author.type === "guest") {
      return true;
    }

    return viewer.type === "oauth" && viewer.id === comment.author.id;
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleteBusy(true);
    setDeleteError(null);

    try {
      await deleteComment(deleteTarget.id, {
        ...(deleteTarget.author.type === "oauth" &&
        viewer.type === "oauth" &&
        viewer.id === deleteTarget.author.id
          ? { authorType: "oauth" as const }
          : {
              authorType: "guest" as const,
              guestPassword: deletePassword,
            }),
      });

      setComments((current) => markCommentDeleted(current, deleteTarget.id));
      setDeleteTarget(null);
      setDeletePassword("");
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "댓글을 삭제하지 못했습니다.",
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-border-3 bg-background-2 p-6 md:p-8">
      <header>
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Comments
        </p>
        <h2 className="mt-3 text-h2 text-text-1">댓글</h2>
        <p className="mt-3 text-body-sm text-text-3">
          현재 {comments.length}개의 루트 댓글이 등록되어 있습니다.
        </p>
      </header>

      <div className="mt-8">
        <CommentForm
          viewerType={viewer.type}
          profile={profile}
          onProfileChange={handleProfileChange}
          onSubmit={handleCreate}
        />
      </div>

      <div className="mt-8">
        {comments.length > 0 ? (
          <ul className="grid gap-5">
            {comments.map((comment) => (
              <li key={comment.id} className="space-y-4">
                <CommentItem
                  comment={comment}
                  onReply={setReplyTarget}
                  canDelete={canDeleteComment(comment)}
                  onDelete={(target) => {
                    setDeleteTarget(target);
                    setDeletePassword("");
                    setDeleteError(null);
                  }}
                />

                {replyTarget?.id === comment.id ? (
                  <CommentForm
                    viewerType={viewer.type}
                    profile={profile}
                    onProfileChange={handleProfileChange}
                    onSubmit={handleCreate}
                    parentId={comment.id}
                    replyToCommentId={comment.id}
                    replyToName={comment.author.name}
                    submitLabel="답글 작성"
                    onCancel={() => setReplyTarget(null)}
                    className="ml-0 md:ml-8"
                  />
                ) : null}

                {comment.replies.length > 0 ? (
                  <ul className="grid gap-4 md:ml-8">
                    {comment.replies.map((reply) => (
                      <li
                        key={reply.id}
                        className="border-l border-border-3 pl-5"
                      >
                        <CommentItem
                          comment={reply}
                          onReply={setReplyTarget}
                          canDelete={canDeleteComment(reply)}
                          onDelete={(target) => {
                            setDeleteTarget(target);
                            setDeletePassword("");
                            setDeleteError(null);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border-3 bg-background-1 px-5 py-8 text-body-md text-text-3">
            첫 댓글을 남겨 보세요.
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => {
          if (deleteBusy) {
            return;
          }

          setDeleteTarget(null);
          setDeletePassword("");
          setDeleteError(null);
        }}
        withBackground
      >
        <div className="p-6 text-left">
          <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
            Delete comment
          </p>
          <h3 className="mt-3 text-body-lg font-semibold text-text-1">
            댓글 삭제
          </h3>
          <p className="mt-3 text-body-sm text-text-3">
            {deleteTarget?.author.type === "oauth" &&
            viewer.type === "oauth" &&
            viewer.id === deleteTarget.author.id
              ? "로그인된 계정으로 작성한 댓글을 삭제합니다."
              : "작성 시 사용한 비밀번호를 입력하면 댓글을 삭제할 수 있습니다."}
          </p>

          {deleteTarget?.author.type === "oauth" &&
          viewer.type === "oauth" &&
          viewer.id === deleteTarget.author.id ? null : (
            <label className="mt-5 block">
              <span className="text-body-sm font-medium text-text-1">
                비밀번호
              </span>
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                disabled={deleteBusy}
                className="mt-2 w-full rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                minLength={4}
                required
              />
            </label>
          )}

          {deleteError ? (
            <div
              role="alert"
              className="mt-4 rounded-[1rem] border border-negative-1/30 bg-negative-1/5 px-4 py-3 text-body-sm text-negative-1"
            >
              {deleteError}
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={
                deleteBusy ||
                (deleteTarget?.author.type !== "oauth" &&
                  deletePassword.trim().length < 4)
              }
              className="inline-flex items-center justify-center rounded-[1rem] bg-negative-1 px-5 py-3 text-body-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteBusy ? "삭제 중..." : "삭제"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteBusy) {
                  return;
                }

                setDeleteTarget(null);
                setDeletePassword("");
                setDeleteError(null);
              }}
              disabled={deleteBusy}
              className="inline-flex items-center justify-center rounded-[1rem] border border-border-3 px-5 py-3 text-body-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              취소
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
