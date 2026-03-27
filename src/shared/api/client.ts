import { ApiResponseError, type ApiError } from "./types";

const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5500";
const INTERNAL_API_URL = process.env.API_URL ?? PUBLIC_API_URL;

async function handleResponse<T>(
  response: Response,
  context?: { url: string; method: string },
): Promise<T> {
  if (!response.ok) {
    const fallback: ApiError = {
      statusCode: response.status,
      message: response.statusText,
    };
    const error: ApiError = await response.json().catch(() => fallback);
    const logPayload = {
      url: context?.url,
      method: context?.method,
      status: response.status,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    if (response.status >= 500) {
      console.error("[API Error]", logPayload);
    } else {
      console.warn("[API Warning]", logPayload);
    }
    throw new ApiResponseError(error);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Server Components (RSC) 용 fetch. 쿠키를 headers에서 직접 전달.
 * context는 전달하지 않음 — 서버 사이드 에러 로깅은 이 이슈 범위 밖 (클라이언트 전용).
 */
export async function serverFetch<T>(
  path: string,
  options: RequestInit = {},
  cookieHeader?: string,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };

  const response = await fetch(`${INTERNAL_API_URL}${path}`, {
    ...options,
    headers,
    cache: options.cache ?? "no-store",
  });

  return handleResponse<T>(response);
}

/**
 * Client Components 용 fetch. 브라우저 쿠키를 자동으로 포함.
 * /manage 경로에서 403 응답 시 /manage/login?reason=forbidden 으로 리다이렉트.
 */
export async function clientFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${PUBLIC_API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (
    response.status === 403 &&
    window.location.pathname.startsWith("/manage")
  ) {
    window.location.href = "/manage/login?reason=forbidden";
    throw new ApiResponseError({
      statusCode: 403,
      message: "접근 권한이 없습니다",
    });
  }

  return handleResponse<T>(response, {
    url: `${PUBLIC_API_URL}${path}`,
    method: options.method ?? "GET",
  });
}
