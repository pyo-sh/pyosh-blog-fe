import type { Asset, UploadedAsset, UploadAssetsResponse } from "./model";
import type { PaginatedResponse } from "@shared/api";
import {
  ApiResponseError,
  type ApiError,
  clientFetch,
  clientMutate,
  getCsrfToken,
} from "@shared/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5500";

async function handleUploadResponse(
  response: Response,
): Promise<UploadAssetsResponse> {
  if (!response.ok) {
    const fallback: ApiError = {
      statusCode: response.status,
      message: response.statusText,
    };
    const error: ApiError = await response.json().catch(() => fallback);
    throw new ApiResponseError(error);
  }

  return response.json() as Promise<UploadAssetsResponse>;
}

export async function fetchAssets(page = 1): Promise<PaginatedResponse<Asset>> {
  return clientFetch<PaginatedResponse<Asset>>(`/api/assets?page=${page}`);
}

export async function uploadAssets(files: File[]): Promise<UploadedAsset[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const csrfToken = await getCsrfToken();
  const response = await fetch(`${API_URL}/api/assets/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: {
      "x-csrf-token": csrfToken,
    },
  });

  const data = await handleUploadResponse(response);

  return data.assets;
}

export async function deleteAsset(id: number): Promise<void> {
  await clientMutate<void>(`/api/assets/${id}`, {
    method: "DELETE",
  });
}
