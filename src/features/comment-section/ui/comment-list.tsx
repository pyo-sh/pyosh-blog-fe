"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CommentForm, type GuestCommentProfile } from "./comment-form";
import { CommentItem } from "./comment-item";
import {
  needsLegacyGuestEmailRecovery,
  readGuestSecretRevealToken,
  readLegacyGuestSecretComment,
  rememberGuestSecretRevealToken,
  removeGuestSecretRevealToken,
} from "../lib/guest-secret-store";
import type {
  Comment,
  CommentListMeta,
  CreateCommentGuestBody,
  CreateCommentOAuthBody,
} from "@entities/comment";
import {
  createComment,
  deleteComment,
  fetchCommentsClient,
  revealSecretComment,
} from "@entities/comment";
import { ApiResponseError } from "@shared/api";
import { Modal, Spinner } from "@shared/ui/libs";

const DEFAULT_COMMENTS_PER_PAGE = 10;
const SECRET_DISPLAY_MASK = "비공개입니다.";
const SECRET_MASK_ALIASES = new Set([
  "This comment is secret.",
  "비공개 메시지입니다",
]);

interface CommentViewer {
  type: "guest" | "oauth";
  id?: number;
}

interface ReplyTarget {
  commentId: number;
  parentId: number;
  replyToCommentId: number;
  replyToName: string;
}

interface CommentListProps {
  postId: number;
  initialComments: Comment[];
  initialMeta: CommentListMeta;
  viewer: CommentViewer;
  initialError?: string | null;
  commentStatus?: "open" | "locked" | "disabled";
}

function getRootCommentId(comment: Comment) {
  return comment.depth === 0 ? comment.id : (comment.parentId ?? comment.id);
}

function sortCommentsDesc(comments: Comment[]) {
  return [...comments].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function appendComment(comments: Comment[], nextComment: Comment): Comment[] {
  if (nextComment.parentId === null) {
    return [...comments, nextComment];
  }

  return comments.map((comment) => {
    if (comment.id !== nextComment.parentId) {
      return {
        ...comment,
        replies: appendComment(comment.replies, nextComment),
      };
    }

    return {
      ...comment,
      replies: sortCommentsDesc([...comment.replies, nextComment]),
    };
  });
}

function hasVisibleReplies(comment: Comment) {
  return comment.replies.length > 0;
}

function markCommentDeleted(comments: Comment[], commentId: number): Comment[] {
  return comments.flatMap((comment) => {
    if (comment.id === commentId) {
      const nextComment: Comment = {
        ...comment,
        status: "deleted",
        body: "",
      };

      return hasVisibleReplies(nextComment) ? [nextComment] : [];
    }

    const nextReplies = markCommentDeleted(comment.replies, commentId);
    const nextComment = {
      ...comment,
      replies: nextReplies,
    };

    if (nextComment.status === "deleted" && nextReplies.length === 0) {
      return [];
    }

    return [nextComment];
  });
}

function createFallbackMeta(comments: Comment[]): CommentListMeta {
  return {
    page: 1,
    limit: DEFAULT_COMMENTS_PER_PAGE,
    totalCount: comments.reduce(
      (count, comment) => count + 1 + comment.replies.length,
      0,
    ),
    totalRootComments: comments.length,
    totalPages: Math.max(
      1,
      Math.ceil(comments.length / DEFAULT_COMMENTS_PER_PAGE),
    ),
  };
}

function countVisibleComments(comments: Comment[]): number {
  return comments.reduce(
    (count, comment) => count + 1 + countVisibleComments(comment.replies),
    0,
  );
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);

  for (
    let page = Math.max(2, currentPage - 1);
    page <= Math.min(totalPages - 1, currentPage + 1);
    page += 1
  ) {
    pages.add(page);
  }

  const sortedPages = [...pages].sort((left, right) => left - right);
  const items: Array<number | "ellipsis"> = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

function collectSecretComments(comments: Comment[]): Comment[] {
  return comments.flatMap((comment) => [
    ...(comment.isSecret && SECRET_MASK_ALIASES.has(comment.body)
      ? [comment]
      : []),
    ...collectSecretComments(comment.replies),
  ]);
}

function getDisplayBody(
  comment: Comment,
  revealedSecretBodies: Record<number, string>,
) {
  if (comment.status === "deleted") {
    return "삭제된 댓글입니다.";
  }

  if (comment.isSecret && SECRET_MASK_ALIASES.has(comment.body)) {
    return revealedSecretBodies[comment.id] ?? SECRET_DISPLAY_MASK;
  }

  return comment.body;
}

function buildReplyTarget(comment: Comment): ReplyTarget {
  return {
    commentId: comment.id,
    parentId: getRootCommentId(comment),
    replyToCommentId: comment.id,
    replyToName: comment.author.name,
  };
}

export function CommentList({
  postId,
  initialComments,
  initialMeta,
  viewer,
  initialError = null,
  commentStatus = "open",
}: CommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [meta, setMeta] = useState<CommentListMeta>(initialMeta);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [pendingScrollCommentId, setPendingScrollCommentId] = useState<
    number | null
  >(null);
  const [expandedRoots, setExpandedRoots] = useState<Record<number, boolean>>(
    {},
  );
  const [profile, setProfile] = useState<GuestCommentProfile>({
    guestName: "",
    guestEmail: "",
    guestPassword: "",
  });
  const [revealedSecretBodies, setRevealedSecretBodies] = useState<
    Record<number, string>
  >({});
  const sectionRef = useRef<HTMLElement | null>(null);
  const commentRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const revealedSecretBodiesRef = useRef<Record<number, string>>({});
  const inFlightRevealIdsRef = useRef<Set<number>>(new Set());
  const secretCommentIdsRef = useRef<Set<number>>(new Set());

  const safeMeta = meta ?? createFallbackMeta(comments);
  const currentPage = meta.page;
  const isLocked = commentStatus === "locked";
  const pageSize = safeMeta.limit || DEFAULT_COMMENTS_PER_PAGE;
  const secretCommentIds = useMemo(
    () => collectSecretComments(comments).map((comment) => comment.id),
    [comments],
  );
  const shouldShowLegacyEmailField =
    viewer.type === "guest" &&
    needsLegacyGuestEmailRecovery(secretCommentIds, {
      guestName: profile.guestName,
      guestEmail: profile.guestEmail,
    });

  const resolvedComments = useMemo(
    () =>
      comments.map((comment) => ({
        ...comment,
        replies: sortCommentsDesc(comment.replies),
      })),
    [comments],
  );

  useEffect(() => {
    setComments(initialComments);
    setMeta(initialMeta);
  }, [initialComments, initialMeta]);

  useEffect(() => {
    setLoadError(initialError);
  }, [initialError]);

  useEffect(() => {
    revealedSecretBodiesRef.current = revealedSecretBodies;
  }, [revealedSecretBodies]);

  useEffect(() => {
    const secretComments = collectSecretComments(comments);
    const secretCommentIdSet = new Set(
      secretComments.map((comment) => comment.id),
    );
    secretCommentIdsRef.current = secretCommentIdSet;
    const legacyBodies = Object.fromEntries(
      secretComments
        .map((comment) => {
          const body = readLegacyGuestSecretComment(comment.id, {
            guestName: profile.guestName,
            guestEmail: profile.guestEmail,
          });

          return body ? [comment.id, body] : null;
        })
        .filter((entry): entry is [number, string] => entry !== null),
    );

    setRevealedSecretBodies((current) => {
      const nextBodies: Record<number, string> = {};

      for (const commentId of secretCommentIdSet) {
        if (legacyBodies[commentId]) {
          nextBodies[commentId] = legacyBodies[commentId];
          continue;
        }

        if (current[commentId]) {
          nextBodies[commentId] = current[commentId];
        }
      }

      return nextBodies;
    });
  }, [comments, profile.guestEmail, profile.guestName]);

  useEffect(() => {
    const secretComments = collectSecretComments(comments);
    const secretCommentIdSet = new Set(
      secretComments.map((comment) => comment.id),
    );
    secretCommentIdsRef.current = secretCommentIdSet;
    const revealTargets = secretComments
      .map((comment) => {
        if (
          revealedSecretBodiesRef.current[comment.id] ||
          inFlightRevealIdsRef.current.has(comment.id)
        ) {
          return null;
        }

        const revealToken = readGuestSecretRevealToken(comment.id);

        return revealToken ? [comment.id, revealToken] : null;
      })
      .filter((entry): entry is [number, string] => entry !== null);

    if (revealTargets.length === 0) {
      return;
    }

    for (const [commentId] of revealTargets) {
      inFlightRevealIdsRef.current.add(commentId);
    }

    void Promise.all(
      revealTargets.map(async ([commentId, revealToken]) => {
        try {
          const revealedComment = await revealSecretComment(
            commentId,
            revealToken,
          );

          return [commentId, revealedComment.body] as const;
        } catch (error) {
          if (
            error instanceof ApiResponseError &&
            (error.statusCode === 403 || error.statusCode === 404)
          ) {
            removeGuestSecretRevealToken(commentId);
          }

          return null;
        }
      }),
    ).then((entries) => {
      for (const [commentId] of revealTargets) {
        inFlightRevealIdsRef.current.delete(commentId);
      }

      const revealedBodies = Object.fromEntries(
        entries.filter(
          (entry): entry is readonly [number, string] =>
            entry !== null && secretCommentIdsRef.current.has(entry[0]),
        ),
      );

      if (Object.keys(revealedBodies).length === 0) {
        return;
      }

      setRevealedSecretBodies((current) => {
        const nextBodies: Record<number, string> = {
          ...current,
          ...revealedBodies,
        };

        for (const commentId of Object.keys(nextBodies).map(Number)) {
          if (!secretCommentIdsRef.current.has(commentId)) {
            delete nextBodies[commentId];
          }
        }

        return nextBodies;
      });
    });
  }, [comments]);

  useEffect(() => {
    setExpandedRoots((current) => {
      const nextState = { ...current };

      for (const comment of initialComments) {
        if (nextState[comment.id] === undefined) {
          nextState[comment.id] = comment.replies.length <= 2;
        }
      }

      return nextState;
    });
  }, [initialComments]);

  useEffect(() => {
    if (!pendingScrollCommentId) {
      return;
    }

    const target = commentRefs.current[pendingScrollCommentId];

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setPendingScrollCommentId(null);
    }
  }, [pendingScrollCommentId, resolvedComments]);

  function registerCommentRef(commentId: number, node: HTMLLIElement | null) {
    commentRefs.current[commentId] = node;
  }

  function handleProfileChange(
    field: keyof GuestCommentProfile,
    value: string,
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function loadPage(
    page: number,
    options?: { scrollToTop?: boolean },
  ): Promise<boolean> {
    setIsLoadingPage(true);
    setLoadError(null);

    try {
      const response = await fetchCommentsClient(postId, {
        page,
        limit: pageSize,
      });

      setComments(response.data);
      setMeta(response.meta);
      setReplyTarget(null);

      if (options?.scrollToTop !== false) {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return true;
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );

      return false;
    } finally {
      setIsLoadingPage(false);
    }
  }

  async function handleCreate(
    payload: CreateCommentGuestBody | CreateCommentOAuthBody,
  ) {
    if (isLocked) {
      setLoadError("댓글이 잠겨 있어 새 댓글이나 답글을 작성할 수 없습니다.");

      return;
    }

    const { comment: nextComment, revealToken } = await createComment(
      postId,
      payload,
    );
    const isRootComment = nextComment.parentId === null;
    const missingRevealToken =
      payload.authorType === "guest" && nextComment.isSecret && !revealToken;

    if (payload.authorType === "guest" && nextComment.isSecret && revealToken) {
      rememberGuestSecretRevealToken(nextComment.id, revealToken);
    }

    let didRefreshFail = false;

    if (isRootComment) {
      const nextRootTotal = meta.totalRootComments + 1;
      const nextTotalPages = Math.max(1, Math.ceil(nextRootTotal / pageSize));
      const targetPage = nextTotalPages;

      if (currentPage === targetPage) {
        setComments((current) => appendComment(current, nextComment));
        setMeta((current) => ({
          ...current,
          totalCount: current.totalCount + 1,
          totalRootComments: nextRootTotal,
          totalPages: nextTotalPages,
          page: targetPage,
        }));
        setPendingScrollCommentId(nextComment.id);
      } else {
        const didReload = await loadPage(targetPage, { scrollToTop: false });

        if (!didReload) {
          didRefreshFail = true;
          setMeta((current) => ({
            ...current,
            totalCount: current.totalCount + 1,
            totalRootComments: nextRootTotal,
            totalPages: nextTotalPages,
          }));
        } else {
          setPendingScrollCommentId(nextComment.id);
        }
      }
    } else {
      setComments((current) => appendComment(current, nextComment));
      setMeta((current) => ({
        ...current,
        totalCount: current.totalCount + 1,
      }));
      setExpandedRoots((current) => ({
        ...current,
        [nextComment.parentId as number]: true,
      }));
      setPendingScrollCommentId(nextComment.id);
    }

    if (!didRefreshFail) {
      setLoadError(
        missingRevealToken
          ? "비밀 댓글이 작성되었지만 복원 토큰을 받지 못했습니다. 새로고침 후에는 원문을 다시 열 수 없을 수 있습니다."
          : null,
      );
    }
    setReplyTarget(null);
  }

  function canDeleteComment(comment: Comment) {
    if (isLocked) {
      return false;
    }

    if (comment.status === "deleted") {
      return false;
    }

    if (comment.author.type === "guest") {
      return true;
    }

    return viewer.type === "oauth" && viewer.id === comment.author.id;
  }

  async function handleDelete() {
    if (!deleteTarget || isLocked) {
      return;
    }

    const target = deleteTarget;
    setDeleteBusy(true);
    setDeleteError(null);

    try {
      const isRootComment = target.parentId === null;
      let didRefreshFail = false;
      await deleteComment(target.id, {
        ...(target.author.type === "oauth" &&
        viewer.type === "oauth" &&
        viewer.id === target.author.id
          ? { authorType: "oauth" as const }
          : {
              authorType: "guest" as const,
              guestPassword: deletePassword,
            }),
      });

      setDeleteTarget(null);
      setDeletePassword("");

      if (isRootComment) {
        const nextComments = markCommentDeleted(comments, target.id);
        const removedCommentCount = Math.max(
          0,
          countVisibleComments(comments) - countVisibleComments(nextComments),
        );
        const rootStillVisible = nextComments.some(
          (comment) => comment.id === target.id,
        );
        const nextRootTotal = rootStillVisible
          ? meta.totalRootComments
          : Math.max(0, meta.totalRootComments - 1);
        const nextTotalPages = Math.max(1, Math.ceil(nextRootTotal / pageSize));
        const targetPage = Math.min(currentPage, nextTotalPages);

        if (!rootStillVisible) {
          didRefreshFail = !(await loadPage(targetPage, {
            scrollToTop: false,
          }));

          if (didRefreshFail) {
            setComments(nextComments);
            setMeta((current) => ({
              ...current,
              totalCount: Math.max(0, current.totalCount - removedCommentCount),
              totalRootComments: nextRootTotal,
              totalPages: nextTotalPages,
              page: targetPage,
            }));
          }
        } else {
          setComments(nextComments);
          setMeta((current) => ({
            ...current,
            totalCount: Math.max(0, current.totalCount - removedCommentCount),
            totalRootComments: nextRootTotal,
            totalPages: nextTotalPages,
            page: targetPage,
          }));
        }
      } else {
        const nextComments = markCommentDeleted(comments, target.id);
        const removedCommentCount = Math.max(
          0,
          countVisibleComments(comments) - countVisibleComments(nextComments),
        );
        const removedRootCount = Math.max(
          0,
          comments.length - nextComments.length,
        );
        const nextRootTotal = Math.max(
          0,
          meta.totalRootComments - removedRootCount,
        );
        const nextTotalPages = Math.max(1, Math.ceil(nextRootTotal / pageSize));
        const targetPage = Math.min(currentPage, nextTotalPages);

        if (removedRootCount > 0) {
          didRefreshFail = !(await loadPage(targetPage, {
            scrollToTop: false,
          }));

          if (didRefreshFail) {
            setComments(nextComments);
            setMeta((current) => ({
              ...current,
              totalCount: Math.max(0, current.totalCount - removedCommentCount),
              totalRootComments: nextRootTotal,
              totalPages: nextTotalPages,
              page: targetPage,
            }));
          }
        } else {
          setComments(nextComments);
          setMeta((current) => ({
            ...current,
            totalCount: Math.max(0, current.totalCount - removedCommentCount),
            totalRootComments: nextRootTotal,
            totalPages: nextTotalPages,
            page: targetPage,
          }));
        }
      }

      if (!didRefreshFail) {
        setLoadError(null);
      }
    } catch (error) {
      if (error instanceof ApiResponseError && error.statusCode === 429) {
        setDeleteError(
          "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해 주세요.",
        );
      } else {
        setDeleteError(
          error instanceof Error
            ? error.message
            : "댓글을 삭제하지 못했습니다.",
        );
      }
    } finally {
      setDeleteBusy(false);
    }
  }

  function handleReply(comment: Comment) {
    if (isLocked) {
      return;
    }

    const target = buildReplyTarget(comment);

    if (replyTarget?.commentId === target.commentId) {
      setReplyTarget(null);

      return;
    }

    setExpandedRoots((current) => ({
      ...current,
      [target.parentId]: true,
    }));
    setReplyTarget(target);
  }

  return (
    <section
      ref={sectionRef}
      className="mt-12 border-t border-border-3 pt-8"
      aria-labelledby="post-comments-heading"
    >
      <header>
        <h2
          id="post-comments-heading"
          className="flex items-baseline gap-1.5 text-h4 text-text-1 md:text-h3"
        >
          댓글{" "}
          <span className="text-h4 text-text-3 md:text-h3">
            ({safeMeta.totalCount})
          </span>
        </h2>
        {isLocked ? (
          <p className="mt-3 rounded-[0.75rem] border border-border-3 bg-background-2 px-4 py-3 text-body-sm text-text-3">
            댓글이 잠겼습니다. 기존 댓글만 확인할 수 있습니다.
          </p>
        ) : null}
      </header>

      {!isLocked ? (
        <div className="mt-8">
          <CommentForm
            viewerType={viewer.type}
            profile={profile}
            forceGuestEmailField={shouldShowLegacyEmailField}
            onProfileChange={handleProfileChange}
            onSubmit={handleCreate}
          />
        </div>
      ) : null}

      <div className="mt-8">
        {loadError ? (
          <div
            role="status"
            className="mb-5 rounded-[0.75rem] border border-border-3 bg-background-2 px-4 py-3 text-body-sm text-text-3"
          >
            {loadError}
          </div>
        ) : null}

        {isLoadingPage ? (
          <div className="flex min-h-48 items-center justify-center rounded-[1rem] border border-dashed border-border-3 bg-background-2 px-5 py-8 text-body-md text-text-3">
            <Spinner size="sm" />
            <span className="ml-3">댓글을 불러오는 중입니다.</span>
          </div>
        ) : resolvedComments.length > 0 ? (
          <ul>
            {resolvedComments.map((comment) => {
              const repliesExpanded =
                expandedRoots[comment.id] ?? comment.replies.length <= 2;
              const shouldShowReplyToggle = comment.replies.length >= 3;
              const visibleReplies =
                shouldShowReplyToggle && !repliesExpanded
                  ? []
                  : comment.replies;

              return (
                <li
                  key={comment.id}
                  ref={(node) => registerCommentRef(comment.id, node)}
                  className="space-y-3"
                >
                  <CommentItem
                    comment={comment}
                    body={getDisplayBody(comment, revealedSecretBodies)}
                    onReply={handleReply}
                    allowReply={!isLocked}
                    canDelete={canDeleteComment(comment)}
                    onDelete={(target) => {
                      setDeleteTarget(target);
                      setDeletePassword("");
                      setDeleteError(null);
                    }}
                    showReplyToggle={shouldShowReplyToggle}
                    repliesExpanded={repliesExpanded}
                    replyCount={comment.replies.length}
                    onToggleReplies={() =>
                      setExpandedRoots((current) => ({
                        ...current,
                        [comment.id]: !repliesExpanded,
                      }))
                    }
                  />

                  {!isLocked && replyTarget?.commentId === comment.id ? (
                    <CommentForm
                      viewerType={viewer.type}
                      profile={profile}
                      forceGuestEmailField={shouldShowLegacyEmailField}
                      onProfileChange={handleProfileChange}
                      onSubmit={handleCreate}
                      parentId={replyTarget.parentId}
                      replyToCommentId={replyTarget.replyToCommentId}
                      replyToName={replyTarget.replyToName}
                      submitLabel="답글 작성"
                      onCancel={() => setReplyTarget(null)}
                      className="ml-6 mt-1"
                    />
                  ) : null}

                  {visibleReplies.length > 0 ? (
                    <ul className="ml-6 border-l-2 border-border-4 pl-4">
                      {visibleReplies.map((reply) => (
                        <li
                          key={reply.id}
                          ref={(node) => registerCommentRef(reply.id, node)}
                          className="last:[&>article]:border-b-0"
                        >
                          <CommentItem
                            comment={reply}
                            body={getDisplayBody(reply, revealedSecretBodies)}
                            onReply={handleReply}
                            allowReply={!isLocked}
                            canDelete={canDeleteComment(reply)}
                            onDelete={(target) => {
                              setDeleteTarget(target);
                              setDeletePassword("");
                              setDeleteError(null);
                            }}
                          />

                          {!isLocked && replyTarget?.commentId === reply.id ? (
                            <CommentForm
                              viewerType={viewer.type}
                              profile={profile}
                              forceGuestEmailField={shouldShowLegacyEmailField}
                              onProfileChange={handleProfileChange}
                              onSubmit={handleCreate}
                              parentId={replyTarget.parentId}
                              replyToCommentId={replyTarget.replyToCommentId}
                              replyToName={replyTarget.replyToName}
                              submitLabel="답글 작성"
                              onCancel={() => setReplyTarget(null)}
                              className="mt-2"
                            />
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-[1rem] border border-dashed border-border-3 bg-background-2 px-5 py-8 text-body-md text-text-3">
            첫 댓글을 남겨 보세요.
          </div>
        )}
      </div>

      {!safeMeta.isLegacy && safeMeta.totalPages > 1 ? (
        <nav
          aria-label="댓글 페이지네이션"
          className="mt-6 flex flex-wrap items-center justify-center gap-1"
        >
          <button
            type="button"
            onClick={() => loadPage(Math.max(1, currentPage - 1))}
            disabled={isLoadingPage || currentPage <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[0.5rem] text-sm text-text-3 transition-colors hover:bg-background-3 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &lsaquo;
          </button>
          {getPaginationItems(currentPage, safeMeta.totalPages).map(
            (page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${currentPage}-${index}`}
                  aria-hidden="true"
                  className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm text-text-4"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => loadPage(page)}
                  disabled={isLoadingPage || page === currentPage}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={
                    page === currentPage
                      ? "inline-flex h-8 min-w-8 items-center justify-center rounded-[0.5rem] bg-primary-1 px-2 text-sm font-semibold text-white"
                      : "inline-flex h-8 min-w-8 items-center justify-center rounded-[0.5rem] px-2 text-sm text-text-3 transition-colors hover:bg-background-3 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
                  }
                >
                  {page}
                </button>
              ),
          )}
          <button
            type="button"
            onClick={() =>
              loadPage(Math.min(safeMeta.totalPages, currentPage + 1))
            }
            disabled={isLoadingPage || currentPage >= safeMeta.totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[0.5rem] text-sm text-text-3 transition-colors hover:bg-background-3 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &rsaquo;
          </button>
        </nav>
      ) : null}

      <Modal
        isOpen={deleteTarget !== null}
        aria-label="댓글 삭제"
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
            댓글 삭제
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

          {deleteTarget && deleteTarget.replies.length > 0 ? (
            <div className="mt-4 rounded-[1rem] border border-warning-1/30 bg-warning-1/5 px-4 py-3 text-body-sm text-warning-1">
              <p className="font-medium">대댓글이 있는 댓글입니다.</p>
              <p className="mt-1">
                삭제 후에도 대댓글 {deleteTarget.replies.length}개는 유지됩니다.
              </p>
            </div>
          ) : null}

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
              {deleteBusy ? (
                <>
                  <Spinner size="sm" /> 삭제 중
                </>
              ) : (
                "삭제"
              )}
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
