"use client";

import { useState } from "react";
import { toast } from "sonner";
import type {
  CreateCommentGuestBody,
  CreateCommentOAuthBody,
} from "@entities/comment";
import type { CreateGuestbookBody } from "@entities/guestbook";
import { ApiResponseError } from "@shared/api";
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
  forceGuestEmailField?: boolean;
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
    return "답글";
  }

  return variant === "guestbook" ? "방명록" : "댓글";
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
    : "이름과 비밀번호를 입력하면 게스트 댓글을 작성할 수 있습니다.";
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
  return variant === "guestbook" ? "비밀 방명록" : "비밀 댓글";
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M16 11V8a4 4 0 0 0-7.2-2.4" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 20 7-7" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 20a6 6 0 0 0-12 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

export function CommentForm<TPayload extends CommentFormPayload>({
  variant = "comment",
  viewerType,
  profile,
  forceGuestEmailField = false,
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
  const bodyLength = body.length;
  const isCommentVariant = variant === "comment";
  const showGuestEmailField =
    viewerType === "guest" &&
    (!isCommentVariant ||
      forceGuestEmailField ||
      Boolean(profile.guestEmail.trim()));

  const isGuestbookVariant = variant === "guestbook";

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
          ...(showGuestEmailField
            ? { guestEmail: profile.guestEmail.trim() }
            : {}),
          guestPassword: profile.guestPassword,
          ...payloadBase,
        } as TPayload);
      }

      setBody("");
      setIsSecret(false);
    } catch (error) {
      if (error instanceof ApiResponseError && error.statusCode === 429) {
        toast.error("너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setErrorMessage(
          getErrorMessage(
            error,
            variant === "guestbook"
              ? "방명록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
              : "댓글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isGuestbookVariant) {
    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          "rounded-[1.5rem] border border-border-3 bg-background-2 p-5 sm:p-6",
          className,
        )}
      >
        {viewerType === "guest" ? (
          <div
            className={cn(
              "grid gap-3",
              showGuestEmailField ? "sm:grid-cols-3" : "sm:grid-cols-2",
            )}
          >
            <label className="block">
              <span className="text-[0.75rem] font-semibold leading-4 tracking-[0.02em] text-text-3">
                이름 <span className="text-negative-1">*</span>
              </span>
              <input
                type="text"
                value={profile.guestName}
                onChange={(event) =>
                  onProfileChange("guestName", event.target.value)
                }
                disabled={isSubmitting}
                className="mt-1.5 w-full rounded-[0.875rem] border border-border-3 bg-background-1 px-3 py-[0.5625rem] text-[0.875rem] leading-[1.1875rem] text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="이름을 입력하세요"
                autoComplete="name"
                required
              />
            </label>

            {showGuestEmailField ? (
              <label className="block">
                <span className="text-[0.75rem] font-semibold leading-4 tracking-[0.02em] text-text-3">
                  이메일
                </span>
                <input
                  type="email"
                  value={profile.guestEmail}
                  onChange={(event) =>
                    onProfileChange("guestEmail", event.target.value)
                  }
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-[0.875rem] border border-border-3 bg-background-1 px-3 py-[0.5625rem] text-[0.875rem] leading-[1.1875rem] text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="이메일 (선택)"
                  autoComplete="email"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-[0.75rem] font-semibold leading-4 tracking-[0.02em] text-text-3">
                비밀번호 <span className="text-negative-1">*</span>
              </span>
              <input
                type="password"
                value={profile.guestPassword}
                onChange={(event) =>
                  onProfileChange("guestPassword", event.target.value)
                }
                disabled={isSubmitting}
                className="mt-1.5 w-full rounded-[0.875rem] border border-border-3 bg-background-1 px-3 py-[0.5625rem] text-[0.875rem] leading-[1.1875rem] text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="삭제 시 필요합니다"
                minLength={4}
                required
              />
            </label>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2.5 border-b border-border-4 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-3 text-text-4">
              <UserIcon />
            </div>
            <div>
              <p className="text-[0.875rem] font-semibold leading-[1.1875rem] text-text-1">
                로그인 사용자
              </p>
              <p className="text-[0.75rem] leading-4 text-text-4">
                로그인 중 · OAuth
              </p>
            </div>
          </div>
        )}

        <label className="mt-3 block">
          <span className="text-[0.75rem] font-semibold leading-4 tracking-[0.02em] text-text-3">
            내용 <span className="text-negative-1">*</span>
          </span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            disabled={isSubmitting}
            className="mt-1.5 min-h-24 w-full rounded-[0.875rem] border border-border-3 bg-background-1 px-3 py-[0.5625rem] text-[0.875rem] leading-[1.6] text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="방명록을 남겨주세요 (최대 2,000자)"
            maxLength={2000}
            required
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] leading-[1.125rem] transition-colors",
              isSecret ? "text-primary-1" : "text-text-3",
            )}
          >
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(event) => setIsSecret(event.target.checked)}
              disabled={isSubmitting}
              className="h-[0.9375rem] w-[0.9375rem] rounded border-border-3 accent-primary-1"
              aria-label={
                isSecret ? "비밀 방명록 해제" : "비밀 방명록으로 작성"
              }
            />
            {isSecret ? <LockIcon /> : <UnlockIcon />}
            비밀글
          </label>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-[0.75rem] leading-4 text-text-4",
                bodyLength >= 2000
                  ? "text-negative-1"
                  : bodyLength >= 1500
                    ? "text-warning-1"
                    : null,
              )}
            >
              {bodyLength}/2000
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-[0.625rem] bg-primary-1 px-5 py-[0.5625rem] text-[0.875rem] font-semibold leading-[1.1875rem] text-white transition-all hover:-translate-y-0.5 hover:bg-secondary-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" /> 저장 중
                </>
              ) : (
                <>
                  <PenIcon />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-4 rounded-[1rem] border border-negative-1/30 bg-negative-1/5 px-4 py-3 text-body-sm text-negative-1"
          >
            {errorMessage}
          </div>
        ) : null}
      </form>
    );
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
        <div
          className={cn(
            "mt-6 grid gap-4",
            showGuestEmailField ? "md:grid-cols-3" : "md:grid-cols-2",
          )}
        >
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

          {showGuestEmailField ? (
            <label className="block">
              <span className="text-body-sm font-medium text-text-1">
                이메일
              </span>
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
          ) : null}

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
        <span
          className={cn(
            "mt-2 block text-right text-body-xs text-text-4",
            bodyLength >= 2000
              ? "text-negative-1"
              : bodyLength >= 1500
                ? "text-warning-1"
                : null,
          )}
        >
          {bodyLength}/2000
        </span>
      </label>

      <button
        type="button"
        onClick={() => setIsSecret((current) => !current)}
        disabled={isSubmitting}
        className={cn(
          "mt-4 inline-flex items-center gap-2 text-body-sm transition-colors",
          isSecret ? "text-primary-1" : "text-text-4",
        )}
        aria-pressed={isSecret}
        aria-label={isSecret ? "비밀 댓글 해제" : "비밀 댓글로 작성"}
      >
        {isSecret ? <LockIcon /> : <UnlockIcon />}
        {getSecretLabel(variant)}
      </button>

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
          {isSubmitting ? (
            <>
              <Spinner size="sm" /> 저장 중
            </>
          ) : (
            submitLabel
          )}
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
