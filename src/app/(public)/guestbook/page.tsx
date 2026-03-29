import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { fetchMeServer } from "@entities/auth";
import { fetchGuestbook, fetchGuestbookSettings } from "@entities/guestbook";
import { GuestbookPageContent } from "@features/guestbook-form";
import { ApiResponseError } from "@shared/api";
import { buildCanonicalMetadata } from "@shared/lib/seo";
import { EmptyState } from "@shared/ui/libs";

export const dynamic = "force-dynamic";

interface GuestbookPageProps {
  searchParams?: {
    page?: string | string[];
  };
}

interface CurrentViewer {
  type: "guest" | "oauth";
  id?: number;
  authErrorMessage?: string;
}

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

function GuestbookPageStatus({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col px-4 py-12 md:px-6">
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-body-lg font-bold tracking-tight text-text-1 sm:text-h1">
            방명록
          </h1>
          <span className="text-body-sm text-text-4">상태 안내</span>
        </div>
        <div className="mt-4 h-px bg-border-4" />
      </header>

      <section className="mt-8">
        <EmptyState variant="page" title={title} description={description} />
      </section>
    </main>
  );
}

export function generateMetadata({
  searchParams,
}: GuestbookPageProps): Metadata {
  const page = parsePage(getSingleValue(searchParams?.page));

  return {
    title: "방명록",
    description: "방명록",
    ...buildCanonicalMetadata("/guestbook", { page }),
  };
}

async function toCookieHeader() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  if (!sessionCookie) {
    return undefined;
  }

  return `${sessionCookie.name}=${sessionCookie.value}`;
}

async function getCurrentViewer(cookieHeader?: string): Promise<CurrentViewer> {
  if (!cookieHeader) {
    return { type: "guest" };
  }

  try {
    const viewer = await fetchMeServer(cookieHeader);

    if (viewer.type === "oauth") {
      return {
        type: "oauth",
        id: viewer.id,
      };
    }

    if (viewer.type === "admin") {
      return { type: "guest" };
    }
  } catch (error) {
    if (error instanceof ApiResponseError && error.statusCode === 401) {
      return { type: "guest" };
    }

    return {
      type: "guest",
      authErrorMessage:
        "로그인 상태를 확인하지 못해 게스트 모드로 표시합니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  return { type: "guest" };
}

export default async function GuestbookPage({
  searchParams,
}: GuestbookPageProps) {
  const page = parsePage(getSingleValue(searchParams?.page));
  const cookieHeader = await toCookieHeader();
  try {
    const settings = await fetchGuestbookSettings(cookieHeader);

    if (!settings.enabled) {
      return (
        <GuestbookPageStatus
          title="현재 방명록 기능이 비활성화되어 있습니다."
          description="운영 설정이 다시 켜지면 이 페이지에서 방명록을 남길 수 있습니다."
        />
      );
    }
  } catch {
    return (
      <GuestbookPageStatus
        title="방명록 설정을 불러오지 못했습니다."
        description="잠시 후 다시 시도해 주세요."
      />
    );
  }

  let response;
  let viewer;

  try {
    [response, viewer] = await Promise.all([
      fetchGuestbook(page, cookieHeader),
      getCurrentViewer(cookieHeader),
    ]);
  } catch {
    return (
      <GuestbookPageStatus
        title="방명록 목록을 불러오지 못했습니다."
        description="네트워크 상태를 확인한 뒤 다시 시도해 주세요."
      />
    );
  }

  return (
    <GuestbookPageContent
      initialEntries={response.data}
      initialMeta={response.meta}
      viewer={viewer}
    />
  );
}
