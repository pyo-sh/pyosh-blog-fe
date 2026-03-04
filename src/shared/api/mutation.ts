import { clientFetch } from "./client";
import { getCsrfToken } from "./csrf";

export async function clientMutate<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const csrfToken = await getCsrfToken();

  return clientFetch<T>(path, {
    method: "POST",
    ...options,
    headers: {
      ...options.headers,
      "x-csrf-token": csrfToken,
    },
  });
}
