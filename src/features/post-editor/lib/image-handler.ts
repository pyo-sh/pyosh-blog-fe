import { uploadAssets } from "@entities/asset";

export const MAX_PENDING_IMAGE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_PENDING_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export type PendingImageStatus = "pending" | "uploaded" | "error";

export interface PendingImage {
  id: string;
  file: File;
  alt: string;
  blobUrl: string;
  insertedAt: number;
  status: PendingImageStatus;
  uploadedUrl?: string;
  errorMessage?: string;
}

export const PENDING_IMAGE_PREFIX = "pending-upload:";

const PENDING_IMAGE_PATTERN =
  /!\[((?:\\.|[^\]])*)\]\(pending-upload:([a-f0-9-]+)\)/g;

export function getPendingImageMarkdown(alt: string, id: string): string {
  return `![${alt}](${PENDING_IMAGE_PREFIX}${id})`;
}

export function getPendingImageIds(contentMd: string): string[] {
  const ids: string[] = [];

  contentMd.replace(PENDING_IMAGE_PATTERN, (_match, _alt, id: string) => {
    ids.push(id);

    return "";
  });

  return ids;
}

export function validatePendingImageFile(file: File): string | null {
  if (!ACCEPTED_PENDING_IMAGE_TYPES.has(file.type)) {
    return `지원하지 않는 파일 형식입니다: ${file.name}`;
  }

  if (file.size > MAX_PENDING_IMAGE_SIZE) {
    return `10MB를 초과하는 파일은 업로드할 수 없습니다: ${file.name}`;
  }

  return null;
}

export function createPendingImage(file: File): PendingImage {
  const id = crypto.randomUUID();

  return {
    id,
    file,
    alt: normalizeAltText(file.name),
    blobUrl: URL.createObjectURL(file),
    insertedAt: Date.now(),
    status: "pending",
  };
}

export function resolvePreviewContent(
  contentMd: string,
  pendingImages: Map<string, PendingImage>,
): string {
  return contentMd.replace(
    PENDING_IMAGE_PATTERN,
    (match, alt: string, id: string) => {
      const pending = pendingImages.get(id);

      if (!pending) {
        return match;
      }

      const source = pending.uploadedUrl ?? pending.blobUrl;

      return `![${alt}](${source})`;
    },
  );
}

export function syncPendingImagesWithContent(
  contentMd: string,
  current: Map<string, PendingImage>,
): {
  pendingImages: Map<string, PendingImage>;
  removedImages: Map<string, PendingImage>;
} {
  const activeIds = new Set(getPendingImageIds(contentMd));
  const pendingImages = new Map<string, PendingImage>();
  const removedImages = new Map<string, PendingImage>();

  for (const [id, image] of current) {
    if (activeIds.has(id)) {
      pendingImages.set(id, image);
      continue;
    }

    URL.revokeObjectURL(image.blobUrl);
    removedImages.set(id, {
      ...image,
      blobUrl: "",
    });
  }

  return { pendingImages, removedImages };
}

export async function uploadPendingImages(
  contentMd: string,
  pendingImages: Map<string, PendingImage>,
  onStatusChange?: (next: Map<string, PendingImage>) => void,
): Promise<{
  contentMd: string;
  pendingImages: Map<string, PendingImage>;
}> {
  const ids = Array.from(new Set(getPendingImageIds(contentMd)));
  const targets = ids
    .map((id) => pendingImages.get(id))
    .filter((image): image is PendingImage => image !== undefined);

  if (targets.length === 0) {
    return { contentMd, pendingImages };
  }

  const uploads = targets.filter((image) => image.status !== "uploaded");

  if (uploads.length === 0) {
    let nextContent = contentMd;

    for (const image of targets) {
      if (!image.uploadedUrl) {
        continue;
      }

      nextContent = nextContent.replaceAll(
        `${PENDING_IMAGE_PREFIX}${image.id}`,
        image.uploadedUrl,
      );
    }

    return { contentMd: nextContent, pendingImages };
  }

  try {
    const uploadedAssets = await uploadAssets(
      uploads.map((image) => image.file),
    );
    const nextImages = new Map(pendingImages);

    uploads.forEach((image, index) => {
      const asset = uploadedAssets[index];

      if (!asset) {
        throw new Error("업로드 응답이 올바르지 않습니다.");
      }

      nextImages.set(image.id, {
        ...image,
        status: "uploaded",
        uploadedUrl: asset.url,
        errorMessage: undefined,
      });
    });

    onStatusChange?.(nextImages);

    let nextContent = contentMd;

    for (const image of targets) {
      const resolved = nextImages.get(image.id);

      if (!resolved?.uploadedUrl) {
        continue;
      }

      nextContent = nextContent.replaceAll(
        `${PENDING_IMAGE_PREFIX}${image.id}`,
        resolved.uploadedUrl,
      );
    }

    return { contentMd: nextContent, pendingImages: nextImages };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.";
    const nextImages = new Map(pendingImages);

    uploads.forEach((image) => {
      nextImages.set(image.id, {
        ...image,
        status: "error",
        errorMessage: message,
      });
    });

    onStatusChange?.(nextImages);
    throw error;
  }
}

function normalizeAltText(filename: string): string {
  const withoutExtension = filename.replace(/\.[^./\\]+$/, "").trim();

  return withoutExtension || "이미지";
}
