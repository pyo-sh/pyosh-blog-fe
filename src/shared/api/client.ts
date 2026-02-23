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

  return handleResponse<T>(response);
}
