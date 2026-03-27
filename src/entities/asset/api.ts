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

export async function fetchAssets(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Asset>> {
  return clientFetch<PaginatedResponse<Asset>>(
    `/api/assets?page=${page}&limit=${limit}`,
  );
}

export async function uploadAssets(
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<UploadedAsset[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const csrfToken = await getCsrfToken();

  return new Promise<UploadedAsset[]>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadAssetsResponse;
          resolve(data.assets);
        } catch {
          reject(new Error("응답을 파싱할 수 없습니다."));
        }

        return;
      }

      const fallback: ApiError = {
        statusCode: xhr.status,
        message: xhr.statusText,
      };
      try {
        const error: ApiError = JSON.parse(xhr.responseText) as ApiError;
        reject(new ApiResponseError(error));
      } catch {
        reject(new ApiResponseError(fallback));
      }
    };

    xhr.onerror = () => {
      reject(new Error("업로드 중 네트워크 오류가 발생했습니다."));
    };

    xhr.open("POST", `${API_URL}/api/assets/upload`);
    xhr.withCredentials = true;
    xhr.setRequestHeader("x-csrf-token", csrfToken);
    xhr.send(formData);
  });
}

export async function deleteAsset(id: number): Promise<void> {
  await clientMutate<void>(`/api/assets/${id}`, {
    method: "DELETE",
  });
}
