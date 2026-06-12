import { beforeEach, describe, expect, it, vi } from "vitest";
import { postUploadUrl } from "#/features/report/api/create-upload-url";
import { uploadFileToPresignedUrl } from "#/features/report/lib/upload-file-to-presigned-url";
import { UPLOAD_CATEGORY_PROFILE } from "#/features/report/model/report-types";
import { prepareProfileImageFile } from "#/features/my/lib/prepare-profile-image-file";
import {
  ProfilePhotoUploadValidationError,
  uploadProfilePhoto,
} from "#/features/my/lib/upload-profile-photo";

vi.mock("#/features/report/api/create-upload-url", () => ({
  postUploadUrl: vi.fn(),
}));

vi.mock("#/features/report/lib/upload-file-to-presigned-url", () => ({
  uploadFileToPresignedUrl: vi.fn(),
}));

vi.mock("#/features/my/lib/prepare-profile-image-file", () => ({
  prepareProfileImageFile: vi.fn(),
}));

describe("uploadProfilePhoto", () => {
  const file = new File(["photo"], "profile-photo.jpg", { type: "image/jpeg" });

  beforeEach(() => {
    vi.mocked(postUploadUrl).mockReset();
    vi.mocked(uploadFileToPresignedUrl).mockReset();
    vi.mocked(prepareProfileImageFile).mockReset();
    vi.mocked(prepareProfileImageFile).mockResolvedValue(file);
  });

  it("PROFILE presigned URL 발급 후 S3 업로드하고 fileUrl을 반환한다", async () => {
    vi.mocked(postUploadUrl).mockResolvedValue({
      uploadUrl: "https://bucket.s3.amazonaws.com/key?X-Amz-Signature=abc",
      fileUrl: "https://cdn.example.com/profile/key.jpg",
      key: "profile/uuid/profile-photo.jpg",
      expiresAt: "2026-06-07T14:16:38.948Z",
    });
    vi.mocked(uploadFileToPresignedUrl).mockResolvedValue(undefined);

    await expect(uploadProfilePhoto( file)).resolves.toBe(
      "https://cdn.example.com/profile/key.jpg",
    );

    expect(prepareProfileImageFile).toHaveBeenCalledWith(file);
    expect(postUploadUrl).toHaveBeenCalledWith({
      category: UPLOAD_CATEGORY_PROFILE,
      fileName: "profile-photo.jpg",
      contentType: "image/jpeg",
    });
    expect(uploadFileToPresignedUrl).toHaveBeenCalledWith({
      uploadUrl: "https://bucket.s3.amazonaws.com/key?X-Amz-Signature=abc",
      file,
      contentType: "image/jpeg",
    });
  });

  it("허용되지 않는 파일이면 ProfilePhotoUploadValidationError를 던진다", async () => {
    const invalidFile = new File(["doc"], "document.hwp", {
      type: "application/x-hwp",
    });

    await expect(uploadProfilePhoto( invalidFile)).rejects.toMatchObject({
      name: "ProfilePhotoUploadValidationError",
      code: "invalid_type",
    } satisfies Partial<ProfilePhotoUploadValidationError>);

    expect(prepareProfileImageFile).not.toHaveBeenCalled();
    expect(postUploadUrl).not.toHaveBeenCalled();
    expect(uploadFileToPresignedUrl).not.toHaveBeenCalled();
  });

  it("GIF, WebP 등 대표 포맷이 아닌 이미지는 거부한다", async () => {
    const webpFile = new File(["webp"], "profile.webp", { type: "image/webp" });

    await expect(uploadProfilePhoto( webpFile)).rejects.toMatchObject({
      name: "ProfilePhotoUploadValidationError",
      code: "invalid_type",
    } satisfies Partial<ProfilePhotoUploadValidationError>);

    expect(prepareProfileImageFile).not.toHaveBeenCalled();
    expect(postUploadUrl).not.toHaveBeenCalled();
    expect(uploadFileToPresignedUrl).not.toHaveBeenCalled();
  });

  it("리사이즈 후에도 5MB를 초과하면 ProfilePhotoUploadValidationError를 던진다", async () => {
    const oversizedFile = new File(["x"], "profile-photo.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(oversizedFile, "size", {
      value: 5 * 1024 * 1024 + 1,
    });
    vi.mocked(prepareProfileImageFile).mockResolvedValue(oversizedFile);

    await expect(uploadProfilePhoto( file)).rejects.toMatchObject({
      name: "ProfilePhotoUploadValidationError",
      code: "max_size",
    } satisfies Partial<ProfilePhotoUploadValidationError>);

    expect(postUploadUrl).not.toHaveBeenCalled();
    expect(uploadFileToPresignedUrl).not.toHaveBeenCalled();
  });
});
