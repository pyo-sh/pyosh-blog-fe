import { clientFetch } from "./client";

let tokenPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  if (!tokenPromise) {
    tokenPromise = clientFetch<{ token: string }>("/api/auth/csrf-token")
      .then((res) => res.token)
      .catch((err) => {
        tokenPromise = null;
        throw err;
      });
  }

  return tokenPromise;
}

export function clearCsrfToken(): void {
  tokenPromise = null;
}
