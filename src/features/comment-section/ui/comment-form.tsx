"use client";

import { useState } from "react";
import type { CreateCommentGuestBody } from "@entities/comment";
import { ApiResponseError } from "@shared/api";
import { cn } from "@shared/lib/style-utils";

export interface GuestCommentProfile {
  guestName: string;
  guestEmail: string;
  guestPassword: string;
}

interface CommentFormProps {
  profile: GuestCommentProfile;
  onProfileChange: (field: keyof GuestCommentProfile, value: string) => void;
  onSubmit: (payload: CreateCommentGuestBody) => Promise<void>;
  parentId?: number;
  replyToCommentId?: number;
  replyToName?: string | null;
  submitLabel?: string;
  onCancel?: () => void;
  className?: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "댓글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function CommentForm({
  profile,
  onProfileChange,
  onSubmit,
  parentId,
  replyToCommentId,
  replyToName,
  submitLabel = "댓글 작성",
  onCancel,
  className,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        authorType: "guest",
        guestName: profile.guestName.trim(),
        guestEmail: profile.guestEmail.trim(),
        guestPassword: profile.guestPassword,
        body: body.trim(),
        isSecret,
        ...(parentId ? { parentId } : {}),
        ...(replyToCommentId ? { replyToCommentId } : {}),
      });

      setBody("");
      setIsSecret(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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
          {replyToName ? "Reply" : "Comment"}
        </p>
        <h3 className="text-body-lg font-semibold text-text-1">
          {replyToName ? `${replyToName}님에게 답글 남기기` : "댓글 남기기"}
        </h3>
        <p className="text-body-sm text-text-3">
          이름, 이메일, 비밀번호를 입력하면 게스트 댓글을 작성할 수 있습니다.
        </p>
      </div>

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
          <span className="text-body-sm font-medium text-text-1">비밀번호</span>
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

      <label className="mt-4 block">
        <span className="text-body-sm font-medium text-text-1">본문</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={isSubmitting}
          className="mt-2 min-h-32 w-full rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder={
            replyToName
              ? "답글 내용을 입력해 주세요"
              : "이 글에 대한 의견을 남겨 주세요"
          }
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
        비밀 댓글로 작성
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
          {isSubmitting ? "저장 중..." : submitLabel}
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
