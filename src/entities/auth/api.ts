import type { AdminUser, CurrentUser, LoginCredentials } from "./model";
import { clientFetch, clientMutate, serverFetch } from "@shared/api";

export async function login(credentials: LoginCredentials): Promise<AdminUser> {
  const response = await clientFetch<{ admin: AdminUser }>(
    "/auth/admin/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    },
  );

  return response.admin;
}

export async function logout(): Promise<void> {
  return clientMutate<void>("/auth/admin/logout");
}

export async function fetchMe(): Promise<CurrentUser> {
  return clientFetch<CurrentUser>("/auth/me");
}

export async function fetchMeServer(
  cookieHeader: string,
): Promise<CurrentUser> {
  return serverFetch<CurrentUser>("/auth/me", {}, cookieHeader);
}
