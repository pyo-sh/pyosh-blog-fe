"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminDeleteComment,
  adminHideComment,
  adminRestoreComment,
  type AdminCommentItem,
} from "./api";
import { getErrorMessage } from "@shared/lib/get-error-message";

const ADMIN_COMMENTS_QUERY_KEY = ["admin-comments"] as const;
const DASHBOARD_RECENT_COMMENTS_QUERY_KEY = [
  "dashboard",
  "recentComments",
] as const;

type AdminCommentStatusTransitionAction = "hide" | "restore" | "soft_delete";

interface AdminCommentStatusMutationVariables {
  comment: AdminCommentItem;
  nextStatus: AdminCommentItem["status"];
}

interface UseAdminCommentStatusMutationOptions {
  onSuccess?: (comment: AdminCommentItem) => void;
}

function resolveStatusTransitionAction(
  currentStatus: AdminCommentItem["status"],
  nextStatus: AdminCommentItem["status"],
): AdminCommentStatusTransitionAction | null {
  if (currentStatus === nextStatus) {
    return null;
  }

  if (nextStatus === "active") {
    return currentStatus === "hidden" || currentStatus === "deleted"
      ? "restore"
      : null;
  }

  if (nextStatus === "hidden") {
    return currentStatus === "active" ? "hide" : null;
  }

  return currentStatus === "active" || currentStatus === "hidden"
    ? "soft_delete"
    : null;
}

function getTransitionSuccessMessage(
  nextStatus: AdminCommentItem["status"],
): string {
  if (nextStatus === "active") {
    return "댓글을 정상 상태로 변경했습니다.";
  }

  if (nextStatus === "hidden") {
    return "댓글을 숨김 상태로 변경했습니다.";
  }

  return "댓글을 삭제 상태로 변경했습니다.";
}

function getTransitionErrorMessage(
  nextStatus: AdminCommentItem["status"],
): string {
  if (nextStatus === "active") {
    return "댓글 복원에 실패했습니다.";
  }

  if (nextStatus === "hidden") {
    return "댓글 숨김 처리에 실패했습니다.";
  }

  return "댓글 삭제 상태 변경에 실패했습니다.";
}

export function canTransitionAdminCommentStatus(
  currentStatus: AdminCommentItem["status"],
  nextStatus: AdminCommentItem["status"],
): boolean {
  return resolveStatusTransitionAction(currentStatus, nextStatus) !== null;
}

export function useAdminCommentStatusMutation(
  options?: UseAdminCommentStatusMutationOptions,
) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      comment,
      nextStatus,
    }: AdminCommentStatusMutationVariables) => {
      const action = resolveStatusTransitionAction(comment.status, nextStatus);

      if (!action) {
        throw new Error("지원하지 않는 댓글 상태 전환입니다.");
      }

      if (action === "restore") {
        await adminRestoreComment(comment.id);
      } else if (action === "hide") {
        await adminHideComment(comment.id);
      } else {
        await adminDeleteComment(comment.id, "soft_delete");
      }

      return {
        updatedComment: {
          ...comment,
          status: nextStatus,
        },
        nextStatus,
      };
    },
    onMutate: () => {
      setErrorMessage(null);
    },
    onSuccess: async ({ updatedComment, nextStatus }) => {
      options?.onSuccess?.(updatedComment);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_COMMENTS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: DASHBOARD_RECENT_COMMENTS_QUERY_KEY,
        }),
      ]);

      toast.success(getTransitionSuccessMessage(nextStatus));
    },
    onError: (error, variables) => {
      const message = getErrorMessage(
        error,
        getTransitionErrorMessage(variables.nextStatus),
      );
      setErrorMessage(message);
      toast.error(message);
    },
  });

  return {
    ...mutation,
    errorMessage,
    changeStatus: (
      comment: AdminCommentItem,
      nextStatus: AdminCommentItem["status"],
    ) => mutation.mutateAsync({ comment, nextStatus }),
  };
}
