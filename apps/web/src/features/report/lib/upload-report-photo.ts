import { postUploadUrl } from "#/features/report/api/create-upload-url";
import { uploadFileToPresignedUrl } from "#/features/report/lib/upload-file-to-presigned-url";
import {
  type ReportPhotoValidationError,
  resolveReportPhotoContentType,
  validateReportPhotoFile,
} from "#/features/report/lib/validate-report-photo-file";
import { UPLOAD_CATEGORY_LOCKER_REPORT } from "#/features/report/model/report-types";

export class ReportPhotoUploadValidationError extends Error {
  readonly code: ReportPhotoValidationError;

  constructor(code: ReportPhotoValidationError) {
    super(code);
    this.name = "ReportPhotoUploadValidationError";
    this.code = code;
  }
}

export async function uploadReportPhoto(
  userId: number,
  file: File,
): Promise<string> {
  const validation = validateReportPhotoFile(file);
  if (!validation.ok) {
    throw new ReportPhotoUploadValidationError(validation.error);
  }

  const contentType = resolveReportPhotoContentType(file);
  const { uploadUrl, fileUrl } = await postUploadUrl(userId, {
    category: UPLOAD_CATEGORY_LOCKER_REPORT,
    fileName: file.name,
    contentType,
  });

  await uploadFileToPresignedUrl({ uploadUrl, file, contentType });
  return fileUrl;
}
