import {
  type ReportPhotoValidationError,
  resolveReportPhotoContentType,
  validateReportPhotoFile,
} from "#/features/report/lib/validate-report-photo-file";
import { postUploadUrl } from "#/shared/api/uploads";
import { uploadFileToObjectStorage } from "#/shared/lib/object-storage-upload";
import { UPLOAD_CATEGORY_LOCKER_REPORT } from "#/shared/model/upload-types";

export class ReportPhotoUploadValidationError extends Error {
  readonly code: ReportPhotoValidationError;

  constructor(code: ReportPhotoValidationError) {
    super(code);
    this.name = "ReportPhotoUploadValidationError";
    this.code = code;
  }
}

export async function uploadReportPhoto(file: File): Promise<string> {
  const validation = validateReportPhotoFile(file);
  if (!validation.ok) {
    throw new ReportPhotoUploadValidationError(validation.error);
  }

  const contentType = resolveReportPhotoContentType(file);
  const upload = await postUploadUrl({
    category: UPLOAD_CATEGORY_LOCKER_REPORT,
    fileName: file.name,
    contentType,
    contentLength: file.size,
  });

  await uploadFileToObjectStorage({
    upload,
    category: UPLOAD_CATEGORY_LOCKER_REPORT,
    file,
    contentType,
  });
  return upload.fileUrl;
}
