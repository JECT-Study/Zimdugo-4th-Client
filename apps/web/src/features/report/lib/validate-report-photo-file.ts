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
  "svg",
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
  if (file.type.startsWith("image/")) {
    return true;
  }

  return ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(file.name));
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
