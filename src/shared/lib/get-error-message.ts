import { ApiResponseError } from "@shared/api";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
