export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
}

export interface CurrentAdminUser {
  type: "admin";
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface CurrentOAuthUser {
  type: "oauth";
  id: number;
  name: string;
  email: string | null;
  githubId: string | null;
  googleEmail: string | null;
}

export type CurrentUser = CurrentAdminUser | CurrentOAuthUser;

export interface LoginCredentials {
  email: string;
  password: string;
}
