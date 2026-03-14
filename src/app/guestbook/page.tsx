import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { fetchGuestbook, type GuestbookEntry } from "@entities/guestbook";
import { Pagination } from "@shared/ui/libs";

export const dynamic = "force-dynamic";

interface GuestbookPageProps {
  searchParams?: {
    page?: string | string[];
  };
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string): number {
  if (value === undefined) {
    return 1;
  }

  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    notFound();
  }

  return page;
}

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

async function toCookieHeader() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  if (!sessionCookie) {
    return undefined;
  }

  return `${sessionCookie.name}=${sessionCookie.value}`;
}

function GuestbookEntryItem({
  entry,
  depth = 0,
}: {
  entry: GuestbookEntry;
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
        <p className="mt-4 whitespace-pre-wrap text-body-md text-text-2">
          {getEntryBody(entry)}
        </p>
      </article>

      {entry.replies.length > 0 ? (
        <ul className="mt-4">
          {entry.replies.map((reply) => (
            <GuestbookEntryItem
              key={reply.id}
              entry={reply}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default async function GuestbookPage({
  searchParams,
}: GuestbookPageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const response = await fetchGuestbook(page, await toCookieHeader());
  const entries = response.data;
  const { meta } = response;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="rounded-[2rem] border border-border-3 bg-background-2 p-8 md:p-10">
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Guestbook
        </p>
        <h1 className="mt-3 text-heading-md text-text-1">방명록</h1>
        <p className="mt-4 max-w-2xl text-body-md text-text-3">
          방문자들이 남긴 메시지 {meta.total.toLocaleString("ko-KR")}개를 확인할
          수 있습니다.
        </p>
      </header>

      {entries.length > 0 ? (
        <>
          <ul className="grid gap-5">
            {entries.map((entry) => (
              <GuestbookEntryItem key={entry.id} entry={entry} />
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
          아직 등록된 방명록이 없습니다.
        </section>
      )}
    </main>
  );
}
