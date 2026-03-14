import type { AdminUser, CurrentUser, LoginCredentials } from "./model";
import { clientFetch, serverFetch } from "@shared/api";

export async function login(credentials: LoginCredentials): Promise<AdminUser> {
  return clientFetch<AdminUser>("/api/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logout(): Promise<void> {
  return clientFetch<void>("/api/auth/admin/logout", {
    method: "POST",
  });
}

export async function fetchMe(): Promise<CurrentUser> {
  return clientFetch<CurrentUser>("/api/auth/me");
}

export async function fetchMeServer(
  cookieHeader: string,
): Promise<CurrentUser> {
  return serverFetch<CurrentUser>("/api/auth/me", {}, cookieHeader);
}
