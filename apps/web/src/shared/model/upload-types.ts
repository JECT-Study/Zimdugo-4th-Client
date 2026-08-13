export type UploadCategory = "PROFILE" | "LOCKER_REPORT";

export const UPLOAD_CATEGORY_LOCKER_REPORT =
  "LOCKER_REPORT" as const satisfies UploadCategory;

export const UPLOAD_CATEGORY_PROFILE =
  "PROFILE" as const satisfies UploadCategory;

export const MAX_UPLOAD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export interface UploadCreateRequest {
  category: UploadCategory;
  fileName: string;
  contentType: string;
  contentLength: number;
}

export interface UploadCreateData {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresAt: string;
}
