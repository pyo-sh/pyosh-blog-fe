import { ApiResponseError, type ApiError } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5500";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallback: ApiError = {
      statusCode: response.status,
      message: response.statusText,
    };
    const error: ApiError = await response.json().catch(() => fallback);
    throw new ApiResponseError(error);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Server Components (RSC) 용 fetch. 쿠키를 headers에서 직접 전달.
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

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: options.cache ?? "no-store",
  });

  return handleResponse<T>(response);
}

/**
 * Client Components 용 fetch. 브라우저 쿠키를 자동으로 포함.
 * /dashboard 경로에서 403 응답 시 /dashboard/login?reason=forbidden 으로 리다이렉트.
 */
export async function clientFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (
    response.status === 403 &&
    window.location.pathname.startsWith("/dashboard")
  ) {
    window.location.href = "/dashboard/login?reason=forbidden";
    throw new ApiResponseError({
      statusCode: 403,
      message: "접근 권한이 없습니다",
    });
  }

  return handleResponse<T>(response);
}
