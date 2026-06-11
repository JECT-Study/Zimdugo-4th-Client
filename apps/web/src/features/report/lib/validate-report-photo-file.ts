import { MAX_REPORT_PHOTO_SIZE_BYTES } from "#/features/report/model/report-types";

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "heif",
  "bmp",
]);

const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/bmp",
]);

export type ReportPhotoValidationError = "invalid_type" | "max_size";

export type ReportPhotoValidationResult =
  | { ok: true }
  | { ok: false; error: ReportPhotoValidationError };

const getFileExtension = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase();
  const lastDotIndex = normalized.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === normalized.length - 1) {
    return "";
  }

  return normalized.slice(lastDotIndex + 1);
};

export const isAcceptedReportPhotoFile = (file: File): boolean => {
  const contentType = file.type.trim().toLowerCase();

  if (contentType) {
    return ALLOWED_IMAGE_CONTENT_TYPES.has(contentType);
  }

  return ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(file.name));
};

const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  bmp: "image/bmp",
};

export const resolveReportPhotoContentType = (file: File): string => {
  const contentType = file.type.trim().toLowerCase();

  if (contentType && ALLOWED_IMAGE_CONTENT_TYPES.has(contentType)) {
    return contentType;
  }

  return EXTENSION_TO_CONTENT_TYPE[getFileExtension(file.name)] ?? file.type;
};

export const validateReportPhotoFile = (
  file: File,
): ReportPhotoValidationResult => {
  if (!isAcceptedReportPhotoFile(file)) {
    return { ok: false, error: "invalid_type" };
  }

  if (file.size > MAX_REPORT_PHOTO_SIZE_BYTES) {
    return { ok: false, error: "max_size" };
  }

  return { ok: true };
};
