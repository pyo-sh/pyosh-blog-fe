"use client";

import { useState } from "react";
import { toast } from "sonner";
import type {
  CreateCommentGuestBody,
  CreateCommentOAuthBody,
} from "@entities/comment";
import type { CreateGuestbookBody } from "@entities/guestbook";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { cn } from "@shared/lib/style-utils";
import { Spinner } from "@shared/ui/libs";

export interface GuestCommentProfile {
  guestName: string;
  guestEmail: string;
  guestPassword: string;
}

type CommentFormPayload =
  | CreateCommentGuestBody
  | CreateCommentOAuthBody
  | CreateGuestbookBody;

interface CommentFormProps<TPayload extends CommentFormPayload> {
  variant?: "comment" | "guestbook";
  viewerType: "guest" | "oauth";
  profile: GuestCommentProfile;
  onProfileChange: (field: keyof GuestCommentProfile, value: string) => void;
  onSubmit: (payload: TPayload) => Promise<void>;
  parentId?: number;
  replyToCommentId?: number;
  replyToName?: string | null;
  submitLabel?: string;
  onCancel?: () => void;
  className?: string;
}

function getEyebrowLabel(
  variant: "comment" | "guestbook",
  replyToName?: string | null,
) {
  if (replyToName) {
    return "Reply";
  }

  return variant === "guestbook" ? "Guestbook" : "Comment";
}

function getTitleLabel(
  variant: "comment" | "guestbook",
  replyToName?: string | null,
) {
  if (replyToName) {
    return `${replyToName}님에게 답글 남기기`;
  }

  return variant === "guestbook" ? "방명록 남기기" : "댓글 남기기";
}

function getDescriptionLabel(
  variant: "comment" | "guestbook",
  viewerType: "guest" | "oauth",
) {
  if (viewerType === "oauth") {
    return variant === "guestbook"
      ? "로그인된 계정으로 방명록을 작성합니다."
      : "로그인된 계정으로 댓글을 작성합니다.";
  }

  return variant === "guestbook"
    ? "이름, 이메일, 비밀번호를 입력하면 방명록을 남길 수 있습니다."
    : "이름, 이메일, 비밀번호를 입력하면 게스트 댓글을 작성할 수 있습니다.";
}

function getBodyPlaceholder(
  variant: "comment" | "guestbook",
  replyToName?: string | null,
) {
  if (replyToName) {
    return "답글 내용을 입력해 주세요";
  }

  return variant === "guestbook"
    ? "방문 메시지를 남겨 주세요"
    : "이 글에 대한 의견을 남겨 주세요";
}

function getSecretLabel(variant: "comment" | "guestbook") {
  return variant === "guestbook" ? "비밀 방명록으로 작성" : "비밀 댓글로 작성";
}

export function CommentForm<TPayload extends CommentFormPayload>({
  variant = "comment",
  viewerType,
  profile,
  onProfileChange,
  onSubmit,
  parentId,
  replyToCommentId,
  replyToName,
  submitLabel = "댓글 작성",
  onCancel,
  className,
}: CommentFormProps<TPayload>) {
  const [body, setBody] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const trimmedBody = body.trim();

      if (!trimmedBody) {
        setErrorMessage("본문을 입력해 주세요.");

        return;
      }

      const payloadBase = {
        body: trimmedBody,
        isSecret,
        ...(parentId ? { parentId } : {}),
        ...(replyToCommentId ? { replyToCommentId } : {}),
      };

      if (viewerType === "oauth") {
        await onSubmit({
          authorType: "oauth",
          ...payloadBase,
        } as TPayload);
      } else {
        await onSubmit({
          authorType: "guest",
          guestName: profile.guestName.trim(),
          guestEmail: profile.guestEmail.trim(),
          guestPassword: profile.guestPassword,
          ...payloadBase,
        } as TPayload);
      }

      setBody("");
      setIsSecret(false);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          variant === "guestbook"
            ? "방명록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
            : "댓글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-[1.5rem] border border-border-3 bg-background-2 p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
          {getEyebrowLabel(variant, replyToName)}
        </p>
        <h3 className="text-body-lg font-semibold text-text-1">
          {getTitleLabel(variant, replyToName)}
        </h3>
        <p className="text-body-sm text-text-3">
          {getDescriptionLabel(variant, viewerType)}
        </p>
      </div>

      {viewerType === "guest" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-body-sm font-medium text-text-1">이름</span>
            <input
              type="text"
              value={profile.guestName}
              onChange={(event) =>
                onProfileChange("guestName", event.target.value)
              }
              disabled={isSubmitting}
              className="mt-2 w-full rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="홍길동"
              required
            />
          </label>

          <label className="block">
            <span className="text-body-sm font-medium text-text-1">이메일</span>
            <input
              type="email"
              value={profile.guestEmail}
              onChange={(event) =>
                onProfileChange("guestEmail", event.target.value)
              }
              disabled={isSubmitting}
              className="mt-2 w-full rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="guest@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-body-sm font-medium text-text-1">
              비밀번호
            </span>
            <input
              type="password"
              value={profile.guestPassword}
              onChange={(event) =>
                onProfileChange("guestPassword", event.target.value)
              }
              disabled={isSubmitting}
              className="mt-2 w-full rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="삭제 시 필요합니다"
              minLength={4}
              required
            />
          </label>
        </div>
      ) : null}

      <label className="mt-4 block">
        <span className="text-body-sm font-medium text-text-1">본문</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={isSubmitting}
          className="mt-2 min-h-32 w-full rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder={getBodyPlaceholder(variant, replyToName)}
          maxLength={2000}
          required
        />
      </label>

      <label className="mt-4 inline-flex items-center gap-3 text-body-sm text-text-2">
        <input
          type="checkbox"
          checked={isSecret}
          onChange={(event) => setIsSecret(event.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-border-3 text-primary-1 focus:ring-primary-1"
        />
        {getSecretLabel(variant)}
      </label>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-[1rem] border border-negative-1/30 bg-negative-1/5 px-4 py-3 text-body-sm text-negative-1"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-[1rem] bg-primary-1 px-5 py-3 text-body-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <><Spinner size="sm" /> 저장 중</> : submitLabel}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-[1rem] border border-border-3 px-5 py-3 text-body-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            취소
          </button>
        ) : null}
      </div>
    </form>
  );
}
