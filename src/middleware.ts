import { NextResponse, type NextRequest } from "next/server";

const MANAGE_LOGIN_PATH = "/manage/login";
const MANAGE_HOME_PATH = "/manage";
const API_URL = process.env.API_URL ?? "http://localhost:5500";

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
    const response = await fetch(`${API_URL}/api/auth/me`, {
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
  const authenticated = await isAuthenticated(request);

  if (request.nextUrl.pathname === MANAGE_LOGIN_PATH) {
    if (authenticated) {
      return redirectToManage(request);
    }

    return NextResponse.next();
  }

  if (!authenticated) {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/manage/:path*",
};
