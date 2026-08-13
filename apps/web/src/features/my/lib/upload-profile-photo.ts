import { prepareProfileImageFile } from "#/features/my/lib/prepare-profile-image-file";
import {
  type ProfilePhotoValidationError,
  resolveProfilePhotoContentType,
  validateProfilePhotoFile,
} from "#/features/my/lib/validate-profile-photo-file";
import { postUploadUrl } from "#/shared/api/uploads";
import { uploadFileToUploadUrl } from "#/shared/lib/upload-file-to-upload-url";
import {
  MAX_UPLOAD_IMAGE_SIZE_BYTES,
  UPLOAD_CATEGORY_PROFILE,
} from "#/shared/model/upload-types";

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

  if (preparedFile.size > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
    throw new ProfilePhotoUploadValidationError("max_size");
  }

  const contentType = resolveProfilePhotoContentType(preparedFile);
  const upload = await postUploadUrl({
    category: UPLOAD_CATEGORY_PROFILE,
    fileName: preparedFile.name,
    contentType,
    contentLength: preparedFile.size,
  });

  await uploadFileToUploadUrl({
    upload,
    category: UPLOAD_CATEGORY_PROFILE,
    file: preparedFile,
    contentType,
  });

  return upload.fileUrl;
}
