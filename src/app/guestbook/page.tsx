import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { fetchMeServer } from "@entities/auth";
import { fetchGuestbook } from "@entities/guestbook";
import { GuestbookPageContent } from "@features/guestbook-form";
import { ApiResponseError } from "@shared/api";

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

async function toCookieHeader() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  if (!sessionCookie) {
    return undefined;
  }

  return `${sessionCookie.name}=${sessionCookie.value}`;
}

async function getCurrentViewer(): Promise<CurrentViewer> {
  const cookieHeader = await toCookieHeader();

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
  const response = await fetchGuestbook(page, await toCookieHeader());
  const viewer = await getCurrentViewer();

  return (
    <GuestbookPageContent
      initialEntries={response.data}
      initialMeta={response.meta}
      viewer={viewer}
    />
  );
}
