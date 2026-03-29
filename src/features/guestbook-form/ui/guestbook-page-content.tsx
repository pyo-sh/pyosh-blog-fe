"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaginatedResponse } from "@shared/api";
import {
  createGuestbookEntry,
  deleteGuestbookEntry,
  type CreateGuestbookBody,
  type GuestbookEntry,
} from "@entities/guestbook";
import {
  CommentForm,
  type GuestCommentProfile,
} from "@features/comment-section";
import { ApiResponseError } from "@shared/api";
import { cn } from "@shared/lib/style-utils";
import {
  EmptyState,
  Modal,
  Pagination,
  ScrollToTop,
  Spinner,
} from "@shared/ui/libs";

interface GuestbookViewer {
  type: "guest" | "oauth";
  id?: number;
  authErrorMessage?: string;
}

interface GuestbookPageContentProps {
  initialEntries: GuestbookEntry[];
  initialMeta: PaginatedResponse<GuestbookEntry>["meta"];
  viewer: GuestbookViewer;
}

const fallbackDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();

  if (diffMs < 0) return "방금 전";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;

  return fallbackDateFormatter.format(new Date(value));
}

function getAuthorName(entry: GuestbookEntry) {
  if (entry.status === "deleted") {
    return "알 수 없음";
  }

  return entry.author.name;
}

function getEntryBody(entry: GuestbookEntry): {
  text: string;
  masked: boolean;
} {
  if (entry.status === "deleted") {
    return { text: "삭제된 방명록입니다.", masked: true };
  }

  if (entry.isSecret && !entry.body) {
    return { text: "비밀 방명록입니다.", masked: true };
  }

  return { text: entry.body, masked: false };
}

function markGuestbookDeleted(
  entries: GuestbookEntry[],
  entryId: number,
): GuestbookEntry[] {
  return entries.map((entry) => {
    if (entry.id === entryId) {
      return { ...entry, status: "deleted", body: "" };
    }

    return entry;
  });
}

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "방명록을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

function getAvatarLabel(entry: GuestbookEntry) {
  if (entry.status === "deleted") {
    return null;
  }

  return getAuthorName(entry).trim().charAt(0).toUpperCase();
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
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

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 2.9 17.2A2 2 0 0 0 4.7 20h14.6a2 2 0 0 0 1.8-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 10h10" />
      <path d="M7 14h6" />
      <path d="M5 19V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3Z" />
    </svg>
  );
}

function GuestbookEntryItem({
  entry,
  onDelete,
  canDeleteEntry,
  entryRef,
}: {
  entry: GuestbookEntry;
  onDelete: (entry: GuestbookEntry) => void;
  canDeleteEntry: (entry: GuestbookEntry) => boolean;
  entryRef?: React.Ref<HTMLLIElement>;
}) {
  const body = getEntryBody(entry);
  const avatarLabel = getAvatarLabel(entry);
  const isDeleted = entry.status === "deleted";
  const isOAuth = entry.author.type === "oauth";

  return (
    <li
      ref={entryRef}
      className="border-b border-border-4 py-5 first:pt-0 last:border-b-0 last:pb-0"
    >
      <article className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-body-sm font-bold",
            isDeleted
              ? "bg-background-3 text-text-4"
              : isOAuth
                ? "bg-primary-1/15 text-primary-1"
                : "bg-background-3 text-text-3",
          )}
        >
          {avatarLabel ? avatarLabel : <UserIcon />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-body-sm font-semibold",
                  isDeleted ? "text-text-4" : "text-text-1",
                )}
              >
                {getAuthorName(entry)}
              </span>

              {isOAuth && !isDeleted ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-info-1/10 px-2 py-1 text-[0.6875rem] font-semibold text-info-1">
                  <UserIcon />
                  OAuth
                </span>
              ) : null}

              {entry.isSecret && !isDeleted ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary-1/10 px-2 py-1 text-[0.6875rem] font-semibold text-primary-1">
                  <LockIcon className="h-3.5 w-3.5" />
                  비밀글
                </span>
              ) : null}

              <time
                dateTime={entry.createdAt}
                className="text-body-xs text-text-4"
              >
                {formatRelativeTime(entry.createdAt)}
              </time>
            </div>

            {canDeleteEntry(entry) ? (
              <button
                type="button"
                onClick={() => onDelete(entry)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-body-xs font-medium text-text-4 transition-colors hover:bg-negative-1/8 hover:text-negative-1"
              >
                <TrashIcon className="h-[0.8125rem] w-[0.8125rem]" />
                삭제
              </button>
            ) : null}
          </div>

          {body.masked ? (
            <div
              className={cn(
                "inline-flex max-w-full items-center gap-2 rounded-xl px-4 py-3 text-body-sm italic",
                isDeleted ? "text-text-4" : "bg-background-2 text-text-4",
              )}
            >
              {entry.isSecret && !isDeleted ? (
                <LockIcon className="shrink-0" />
              ) : (
                <TrashIcon className="shrink-0" />
              )}
              <span className="break-keep">{body.text}</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-keep text-body-sm leading-relaxed text-text-2">
              {body.text}
            </p>
          )}
        </div>
      </article>
    </li>
  );
}

export function GuestbookPageContent({
  initialEntries,
  initialMeta,
  viewer,
}: GuestbookPageContentProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [meta, setMeta] = useState(initialMeta);
  const [newEntryId, setNewEntryId] = useState<number | null>(null);
  const newEntryRef = useRef<HTMLLIElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<GuestbookEntry | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [profile, setProfile] = useState<GuestCommentProfile>({
    guestName: "",
    guestEmail: "",
    guestPassword: "",
  });

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  useEffect(() => {
    setMeta(initialMeta);
  }, [initialMeta]);

  useEffect(() => {
    if (newEntryId !== null && newEntryRef.current) {
      newEntryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setNewEntryId(null);
    }
  }, [newEntryId]);

  function handleProfileChange(
    field: keyof GuestCommentProfile,
    value: string,
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function canDeleteEntry(entry: GuestbookEntry) {
    if (entry.status === "deleted") {
      return false;
    }

    if (entry.author.type === "guest") {
      return true;
    }

    return viewer.type === "oauth" && viewer.id === entry.author.id;
  }

  async function handleCreate(payload: CreateGuestbookBody) {
    const nextEntry = await createGuestbookEntry(payload);

    if (meta.page !== 1) {
      router.push("/guestbook?page=1");

      return;
    }

    setEntries((current) => [nextEntry, ...current].slice(0, meta.limit));
    setMeta((current) => {
      const total = current.total + 1;

      return {
        ...current,
        total,
        totalPages: Math.max(1, Math.ceil(total / current.limit)),
      };
    });
    setNewEntryId(nextEntry.id);
  }

  const handleOpenDelete = useCallback((target: GuestbookEntry) => {
    setDeleteTarget(target);
    setDeletePassword("");
    setDeleteError(null);
  }, []);

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleteBusy(true);
    setDeleteError(null);

    try {
      if (
        deleteTarget.author.type === "oauth" &&
        viewer.type === "oauth" &&
        viewer.id === deleteTarget.author.id
      ) {
        await deleteGuestbookEntry(deleteTarget.id, {});
      } else {
        await deleteGuestbookEntry(deleteTarget.id, {
          guestPassword: deletePassword,
        });
      }

      setEntries((current) => markGuestbookDeleted(current, deleteTarget.id));
      setDeleteTarget(null);
      setDeletePassword("");
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  }

  const requiresPassword = !(
    deleteTarget?.author.type === "oauth" &&
    viewer.type === "oauth" &&
    viewer.id === deleteTarget.author.id
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col px-4 py-12 md:px-6">
      <header className="motion-reveal">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-body-lg font-bold tracking-tight text-text-1 sm:text-h1">
            방명록
          </h1>
          <span className="text-body-sm text-text-4">
            총 {meta.total.toLocaleString("ko-KR")}개 방명록
          </span>
        </div>
        <div className="mt-4 h-px bg-border-4" />
      </header>

      {viewer.authErrorMessage ? (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-warning-1/25 bg-warning-2 px-4 py-4 text-body-sm text-text-3 motion-reveal"
        >
          <span className="mt-0.5 shrink-0 text-warning-1">
            <AlertIcon />
          </span>
          <p className="break-keep">{viewer.authErrorMessage}</p>
        </div>
      ) : null}

      <section className="mt-6 motion-reveal" aria-label="방명록 작성">
        <CommentForm<CreateGuestbookBody>
          variant="guestbook"
          viewerType={viewer.type}
          profile={profile}
          onProfileChange={handleProfileChange}
          onSubmit={handleCreate}
          submitLabel="작성하기"
        />
      </section>

      <section className="mt-8 motion-reveal" aria-label="방명록 목록">
        {entries.length > 0 ? (
          <>
            <ul>
              {entries.map((entry) => (
                <GuestbookEntryItem
                  key={entry.id}
                  entry={entry}
                  onDelete={handleOpenDelete}
                  canDeleteEntry={canDeleteEntry}
                  entryRef={entry.id === newEntryId ? newEntryRef : undefined}
                />
              ))}
            </ul>

            <div className="mt-8">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                basePath="/guestbook"
              />
            </div>
          </>
        ) : (
          <EmptyState
            variant="page"
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-3 text-text-4">
                <MessageIcon />
              </div>
            }
            title="아직 방명록이 없습니다."
            description="첫 번째 방명록을 남겨보세요!"
          />
        )}
      </section>

      <ScrollToTop />

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
        aria-label="방명록 삭제"
      >
        <div className="min-w-[min(23rem,calc(100vw-2rem))] rounded-[1.25rem] bg-background-1 p-7 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-negative-1/10 text-negative-1">
              <TrashIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-1">방명록 삭제</h2>
              <p className="mt-1 text-body-xs text-text-4">
                {requiresPassword
                  ? "작성 시 입력한 비밀번호를 확인합니다."
                  : "이 방명록을 삭제하시겠습니까?"}
              </p>
            </div>
          </div>

          {requiresPassword ? (
            <label className="mt-5 block">
              <span className="text-body-sm font-medium text-text-1">
                비밀번호
              </span>
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                disabled={deleteBusy}
                className="mt-2 w-full rounded-[0.875rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="비밀번호를 입력하세요"
                minLength={4}
                required
              />
            </label>
          ) : (
            <p className="mt-5 break-keep text-body-sm text-text-3">
              삭제된 방명록은 복구할 수 없으며, 이후에는 "삭제된
              방명록입니다."로 표시됩니다.
            </p>
          )}

          {deleteError ? (
            <div
              role="alert"
              className="mt-4 rounded-[1rem] border border-negative-1/25 bg-negative-1/5 px-4 py-3 text-body-sm text-negative-1"
            >
              {deleteError}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
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
              className="inline-flex items-center justify-center rounded-[0.875rem] bg-background-3 px-5 py-2.5 text-body-sm font-semibold text-text-2 transition-colors hover:bg-background-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={
                deleteBusy ||
                (requiresPassword && deletePassword.trim().length < 4)
              }
              className="inline-flex min-w-[5.5rem] items-center justify-center rounded-[0.875rem] bg-negative-1 px-5 py-2.5 text-body-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteBusy ? (
                <>
                  <Spinner size="sm" /> 삭제 중
                </>
              ) : (
                "삭제"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
