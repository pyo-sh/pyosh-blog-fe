"use client";

import { useEffect, useState } from "react";
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
import { Modal, Pagination } from "@shared/ui/libs";

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

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

function getAuthorName(entry: GuestbookEntry) {
  return entry.author.name;
}

function getEntryBody(entry: GuestbookEntry) {
  if (entry.status === "deleted") {
    return "삭제된 방명록입니다.";
  }

  return entry.body;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function appendGuestbookEntry(
  entries: GuestbookEntry[],
  nextEntry: GuestbookEntry,
): GuestbookEntry[] {
  if (nextEntry.parentId === null) {
    return [nextEntry, ...entries];
  }

  return entries.map((entry) => {
    if (entry.id === nextEntry.parentId) {
      return {
        ...entry,
        replies: [...entry.replies, nextEntry],
      };
    }

    return {
      ...entry,
      replies: appendGuestbookEntry(entry.replies, nextEntry),
    };
  });
}

function markGuestbookDeleted(
  entries: GuestbookEntry[],
  entryId: number,
): GuestbookEntry[] {
  return entries.map((entry) => {
    if (entry.id === entryId) {
      return {
        ...entry,
        status: "deleted",
        body: "",
      };
    }

    return {
      ...entry,
      replies: markGuestbookDeleted(entry.replies, entryId),
    };
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

function GuestbookEntryItem({
  entry,
  onDelete,
  canDeleteEntry,
  depth = 0,
}: {
  entry: GuestbookEntry;
  onDelete: (entry: GuestbookEntry) => void;
  canDeleteEntry: (entry: GuestbookEntry) => boolean;
  depth?: number;
}) {
  return (
    <li className={depth > 0 ? "mt-4 border-l border-border-3 pl-5" : ""}>
      <article className="rounded-[1.5rem] border border-border-3 bg-background-1 p-5">
        <div className="flex flex-wrap items-center gap-3 text-body-sm text-text-3">
          <span className="font-semibold text-text-1">
            {getAuthorName(entry)}
          </span>
          <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
          {entry.isSecret && entry.status !== "deleted" ? (
            <span className="rounded-full bg-background-2 px-3 py-1 text-body-xs text-text-4">
              Secret
            </span>
          ) : null}
        </div>

        <p className="mt-4 whitespace-pre-wrap break-words text-body-md text-text-2">
          {getEntryBody(entry)}
        </p>

        {canDeleteEntry(entry) ? (
          <button
            type="button"
            onClick={() => onDelete(entry)}
            className="mt-4 inline-flex items-center justify-center rounded-[1rem] border border-negative-1/20 px-4 py-2 text-body-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/5"
          >
            삭제
          </button>
        ) : null}
      </article>

      {entry.replies.length > 0 ? (
        <ul className="mt-4">
          {entry.replies.map((reply) => (
            <GuestbookEntryItem
              key={reply.id}
              entry={reply}
              onDelete={onDelete}
              canDeleteEntry={canDeleteEntry}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
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

    setEntries((current) => {
      const nextEntries = appendGuestbookEntry(current, nextEntry);

      return nextEntries.slice(0, meta.limit);
    });
    setMeta((current) => {
      const total = current.total + 1;

      return {
        ...current,
        total,
        totalPages: Math.max(1, Math.ceil(total / current.limit)),
      };
    });
  }

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Guestbook
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">방명록</h1>
        <p className="mt-4 max-w-2xl text-body-md text-text-3">
          방문자들이 남긴 메시지 {meta.total.toLocaleString("ko-KR")}개를
          확인하고 직접 인사를 남길 수 있습니다.
        </p>
      </header>

      <CommentForm<CreateGuestbookBody>
        variant="guestbook"
        viewerType={viewer.type}
        profile={profile}
        onProfileChange={handleProfileChange}
        onSubmit={handleCreate}
        submitLabel="방명록 작성"
      />

      {viewer.authErrorMessage ? (
        <div
          role="status"
          className="rounded-[1.5rem] border border-border-3 bg-background-2 px-5 py-4 text-body-sm text-text-3"
        >
          {viewer.authErrorMessage}
        </div>
      ) : null}

      {entries.length > 0 ? (
        <>
          <ul className="grid gap-5">
            {entries.map((entry) => (
              <GuestbookEntryItem
                key={entry.id}
                entry={entry}
                onDelete={(target) => {
                  setDeleteTarget(target);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                canDeleteEntry={canDeleteEntry}
              />
            ))}
          </ul>

          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            basePath="/guestbook"
          />
        </>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-border-3 bg-background-2 p-8 text-body-md text-text-3 md:p-10">
          아직 등록된 방명록이 없습니다. 첫 메시지를 남겨 보세요.
        </section>
      )}

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
            Delete guestbook entry
          </p>
          <h3 className="mt-3 text-body-lg font-semibold text-text-1">
            방명록 삭제
          </h3>
          <p className="mt-3 text-body-sm text-text-3">
            {deleteTarget?.author.type === "oauth" &&
            viewer.type === "oauth" &&
            viewer.id === deleteTarget.author.id
              ? "로그인된 계정으로 작성한 방명록을 삭제합니다."
              : "작성 시 사용한 비밀번호를 입력하면 방명록을 삭제할 수 있습니다."}
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
              onClick={() => void handleDelete()}
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
    </main>
  );
}
