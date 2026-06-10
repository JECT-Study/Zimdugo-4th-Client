import { MAX_REPORT_PHOTO_SIZE_BYTES } from "#/features/report/model/report-types";

const ALLOWED_PROFILE_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

const ALLOWED_PROFILE_IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
]);

export type ProfilePhotoValidationError = "invalid_type" | "max_size";

export type ProfilePhotoValidationResult =
  | { ok: true }
  | { ok: false; error: ProfilePhotoValidationError };

const getFileExtension = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase();
  const lastDotIndex = normalized.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === normalized.length - 1) {
    return "";
  }

  return normalized.slice(lastDotIndex + 1);
};

export const isAcceptedProfilePhotoFile = (file: File): boolean => {
  const contentType = file.type.trim().toLowerCase();

  if (
    contentType &&
    ALLOWED_PROFILE_IMAGE_CONTENT_TYPES.has(contentType)
  ) {
    return true;
  }

  return ALLOWED_PROFILE_IMAGE_EXTENSIONS.has(getFileExtension(file.name));
};

const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export const resolveProfilePhotoContentType = (file: File): string => {
  const contentType = file.type.trim().toLowerCase();

  if (contentType && ALLOWED_PROFILE_IMAGE_CONTENT_TYPES.has(contentType)) {
    return contentType;
  }

  return EXTENSION_TO_CONTENT_TYPE[getFileExtension(file.name)] ?? contentType;
};

export const validateProfilePhotoFile = (
  file: File,
): ProfilePhotoValidationResult => {
  if (!isAcceptedProfilePhotoFile(file)) {
    return { ok: false, error: "invalid_type" };
  }

  if (file.size > MAX_REPORT_PHOTO_SIZE_BYTES) {
    return { ok: false, error: "max_size" };
  }

  return { ok: true };
};
