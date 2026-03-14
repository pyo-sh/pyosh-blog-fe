import { NextResponse, type NextRequest } from "next/server";

const DASHBOARD_LOGIN_PATH = "/dashboard/login";
const API_URL =
  process.env.API_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5500"
    : (() => {
        throw new Error("API_URL env var is required in production");
      })());

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = DASHBOARD_LOGIN_PATH;
  loginUrl.search = "";
  loginUrl.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie");

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
  if (request.nextUrl.pathname === DASHBOARD_LOGIN_PATH) {
    return NextResponse.next();
  }

  const authenticated = await isAuthenticated(request);

  if (!authenticated) {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
