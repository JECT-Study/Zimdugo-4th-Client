import { prepareProfileImageFile } from "#/features/my/lib/prepare-profile-image-file";
import {
  type ProfilePhotoValidationError,
  resolveProfilePhotoContentType,
  validateProfilePhotoFile,
} from "#/features/my/lib/validate-profile-photo-file";
import { postUploadUrl } from "#/features/report/api/create-upload-url";
import { uploadFileToPresignedUrl } from "#/features/report/lib/upload-file-to-presigned-url";
import {
  MAX_REPORT_PHOTO_SIZE_BYTES,
  UPLOAD_CATEGORY_PROFILE,
} from "#/features/report/model/report-types";

export class ProfilePhotoUploadValidationError extends Error {
  readonly code: ProfilePhotoValidationError;

  constructor(code: ProfilePhotoValidationError) {
    super(code);
    this.name = "ProfilePhotoUploadValidationError";
    this.code = code;
  }
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  const validation = validateProfilePhotoFile(file);
  if (!validation.ok) {
    throw new ProfilePhotoUploadValidationError(validation.error);
  }

  const preparedFile = await prepareProfileImageFile(file);

  if (preparedFile.size > MAX_REPORT_PHOTO_SIZE_BYTES) {
    throw new ProfilePhotoUploadValidationError("max_size");
  }

  const contentType = resolveProfilePhotoContentType(preparedFile);
  const { uploadUrl, fileUrl } = await postUploadUrl({
    category: UPLOAD_CATEGORY_PROFILE,
    fileName: preparedFile.name,
    contentType,
    contentLength: preparedFile.size,
  });

  await uploadFileToPresignedUrl({
    uploadUrl,
    file: preparedFile,
    contentType,
  });

  return fileUrl;
}
