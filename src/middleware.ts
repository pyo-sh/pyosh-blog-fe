import { NextResponse, type NextRequest } from "next/server";

const MANAGE_LOGIN_PATH = "/manage/login";
const MANAGE_HOME_PATH = "/manage";
const API_URL = process.env.API_URL ?? "http://localhost:5500";
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
const NOINDEX_HEADER_VALUE = "noindex, nofollow";

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
    joinSources(
      "style-src 'self' 'unsafe-inline'",
      "https://fonts.googleapis.com",
    ),
    "font-src 'self' https://fonts.gstatic.com",
    joinSources(
      "connect-src 'self'",
      NEXT_PUBLIC_API_URL,
      isDev ? "ws: wss:" : "",
    ),
  ].join("; ");
}

function isProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
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

  if (!isProductionDeployment()) {
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

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = MANAGE_LOGIN_PATH;
  loginUrl.search = "";
  loginUrl.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie");

  if (
    process.env.NODE_ENV === "production" &&
    typeof process.env.API_URL === "undefined"
  ) {
    console.error("[middleware] API_URL is not set; denying manage access");

    return false;
  }

  if (!cookieHeader) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  if (
    request.nextUrl.pathname === MANAGE_HOME_PATH ||
    request.nextUrl.pathname.startsWith(`${MANAGE_HOME_PATH}/`)
  ) {
    const authenticated = await isAuthenticated(request);

    if (request.nextUrl.pathname === MANAGE_LOGIN_PATH) {
      if (authenticated) {
        return redirectToManage(request);
      }

      return nextWithCsp(request, nonce);
    }

    if (!authenticated) {
      return redirectToLogin(request);
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
