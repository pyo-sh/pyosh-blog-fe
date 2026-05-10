import { NextResponse, type NextRequest } from "next/server";

const MANAGE_LOGIN_PATH = "/manage/login";
const MANAGE_HOME_PATH = "/manage";
const API_URL = process.env.API_URL ?? "http://localhost:5500";
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
const NOINDEX_HEADER_VALUE = "noindex, nofollow";
const PRODUCTION_HOSTS = new Set(["pyosh.com", "www.pyosh.com"]);

type ManageAuthState = "admin" | "anonymous" | "non_admin" | "unavailable";

function joinSources(...sources: Array<string | false | null | undefined>) {
  return sources.filter(Boolean).join(" ");
}

function buildCspDirectives(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  return [
    "default-src 'self'",
    isDev
      ? "img-src 'self' http: https: data: blob:"
      : "img-src 'self' https: data: blob:",
    [
      "script-src",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ].join(" "),
    "object-src 'none'",
    // Phase 2 prerequisite: replace 'unsafe-inline' with nonce-based styles before enforcement
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    joinSources(
      "connect-src 'self'",
      NEXT_PUBLIC_API_URL,
      isDev ? "ws: wss:" : "",
    ),
  ].join("; ");
}

function shouldBlockIndexing(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (PRODUCTION_HOSTS.has(request.nextUrl.hostname.toLowerCase())) {
    return false;
  }

  const vercelEnv = process.env.VERCEL_ENV?.trim();

  return Boolean(vercelEnv && vercelEnv !== "production");
}

function nextWithCsp(request: NextRequest, nonce: string): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set(
    "Content-Security-Policy-Report-Only",
    buildCspDirectives(nonce),
  );

  if (shouldBlockIndexing(request)) {
    response.headers.set("X-Robots-Tag", NOINDEX_HEADER_VALUE);
  }

  return response;
}

function redirectToManage(request: NextRequest): NextResponse {
  const manageUrl = request.nextUrl.clone();
  manageUrl.pathname = MANAGE_HOME_PATH;
  manageUrl.search = "";

  return NextResponse.redirect(manageUrl);
}

function redirectToLogin(
  request: NextRequest,
  reason?: "admin_required" | "auth_unavailable",
): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = MANAGE_LOGIN_PATH;
  loginUrl.search = "";
  loginUrl.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  if (reason) {
    loginUrl.searchParams.set("reason", reason);
  }

  return NextResponse.redirect(loginUrl);
}

async function getManageAuthState(
  request: NextRequest,
): Promise<ManageAuthState> {
  const cookieHeader = request.headers.get("cookie");

  if (
    process.env.NODE_ENV === "production" &&
    typeof process.env.API_URL === "undefined"
  ) {
    console.error("[middleware] API_URL is not set; denying manage access");

    return "unavailable";
  }

  if (!cookieHeader) {
    return "anonymous";
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (response.status === 401) {
      return "anonymous";
    }

    if (response.status === 403) {
      return "non_admin";
    }

    if (!response.ok) {
      return "unavailable";
    }

    const user: unknown = await response.json();

    if (
      user &&
      typeof user === "object" &&
      "type" in user &&
      user.type === "admin"
    ) {
      return "admin";
    }

    return "non_admin";
  } catch {
    return "unavailable";
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  if (
    request.nextUrl.pathname === MANAGE_HOME_PATH ||
    request.nextUrl.pathname.startsWith(`${MANAGE_HOME_PATH}/`)
  ) {
    const authState = await getManageAuthState(request);

    if (request.nextUrl.pathname === MANAGE_LOGIN_PATH) {
      if (authState === "admin") {
        return redirectToManage(request);
      }

      return nextWithCsp(request, nonce);
    }

    if (authState === "anonymous") {
      return redirectToLogin(request);
    }

    if (authState === "non_admin") {
      return redirectToLogin(request, "admin_required");
    }

    if (authState === "unavailable") {
      return redirectToLogin(request, "auth_unavailable");
    }
  }

  return nextWithCsp(request, nonce);
}

export const config = {
  matcher: [
    "/manage/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
