import type { AdminUser, LoginCredentials } from "./model";
import { clientFetch, serverFetch } from "@/shared/api";

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

export async function fetchMe(): Promise<AdminUser> {
  return clientFetch<AdminUser>("/api/auth/me");
}

export async function fetchMeServer(cookieHeader: string): Promise<AdminUser> {
  return serverFetch<AdminUser>("/api/auth/me", {}, cookieHeader);
}
