import { clientFetch } from "./client";

let cachedToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedToken !== null) {
    return cachedToken;
  }

  const { token } = await clientFetch<{ token: string }>("/api/auth/csrf-token");
  cachedToken = token;
  return cachedToken;
}

export function clearCsrfToken(): void {
  cachedToken = null;
}
