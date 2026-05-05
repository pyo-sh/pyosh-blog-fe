import { cookies } from "next/headers";

export async function toAdminPostCookieHeader(): Promise<string | undefined> {
  // await is a no-op in Next.js 14 but required in Next.js 15 where cookies() returns a Promise.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  if (!sessionCookie) {
    return undefined;
  }

  return `${sessionCookie.name}=${encodeURIComponent(sessionCookie.value)}`;
}
