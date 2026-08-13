import { beforeEach, describe, expect, it, vi } from "vitest";
import { prepareProfileImageFile } from "#/features/my/lib/prepare-profile-image-file";
import {
  type ProfilePhotoUploadValidationError,
  uploadProfilePhoto,
} from "#/features/my/lib/upload-profile-photo";
import { postUploadUrl } from "#/shared/api/uploads";
import { uploadFileToUploadUrl } from "#/shared/lib/upload-file-to-upload-url";
import { UPLOAD_CATEGORY_PROFILE } from "#/shared/model/upload-types";

vi.mock("#/shared/api/uploads", () => ({
  postUploadUrl: vi.fn(),
}));

vi.mock("#/shared/lib/upload-file-to-upload-url", () => ({
  uploadFileToUploadUrl: vi.fn(),
}));

vi.mock("#/features/my/lib/prepare-profile-image-file", () => ({
  prepareProfileImageFile: vi.fn(),
}));

describe("uploadProfilePhoto", () => {
  const uploadUrl =
    "https://objectstorage.ap-osaka-1.oraclecloud.com/p/token/n/axuj36gr8lmm/b/zimdugo-bucket/o/profiles/7/photo.jpg";
  const file = new File(["photo"], "profile-photo.jpg", { type: "image/jpeg" });

  beforeEach(() => {
    vi.mocked(postUploadUrl).mockReset();
    vi.mocked(uploadFileToUploadUrl).mockReset();
    vi.mocked(prepareProfileImageFile).mockReset();
    vi.mocked(prepareProfileImageFile).mockResolvedValue(file);
  });

  it("PROFILE 업로드 URL을 발급받아 파일을 업로드한다", async () => {
    vi.mocked(postUploadUrl).mockResolvedValue({
      uploadUrl,
      fileUrl:
        "https://objectstorage.ap-osaka-1.oraclecloud.com/n/axuj36gr8lmm/b/zimdugo-bucket/o/profiles%2F7%2Fphoto.jpg",
      key: "profiles/7/photo.jpg",
      expiresAt: "2026-06-07T14:16:38.948Z",
    });
    vi.mocked(uploadFileToUploadUrl).mockResolvedValue(undefined);

    await expect(uploadProfilePhoto(file)).resolves.toBe(
      "https://objectstorage.ap-osaka-1.oraclecloud.com/n/axuj36gr8lmm/b/zimdugo-bucket/o/profiles%2F7%2Fphoto.jpg",
    );

    expect(prepareProfileImageFile).toHaveBeenCalledWith(file);
    expect(postUploadUrl).toHaveBeenCalledWith({
      category: UPLOAD_CATEGORY_PROFILE,
      fileName: "profile-photo.jpg",
      contentType: "image/jpeg",
      contentLength: file.size,
    });
    expect(uploadFileToUploadUrl).toHaveBeenCalledWith({
      upload: expect.objectContaining({
        uploadUrl,
        key: "profiles/7/photo.jpg",
      }),
      category: UPLOAD_CATEGORY_PROFILE,
      file,
      contentType: "image/jpeg",
    });
  });

  it("허용되지 않는 파일이면 ProfilePhotoUploadValidationError를 던진다", async () => {
    const invalidFile = new File(["doc"], "document.hwp", {
      type: "application/x-hwp",
    });

    await expect(uploadProfilePhoto(invalidFile)).rejects.toMatchObject({
      name: "ProfilePhotoUploadValidationError",
      code: "invalid_type",
    } satisfies Partial<ProfilePhotoUploadValidationError>);

    expect(prepareProfileImageFile).not.toHaveBeenCalled();
    expect(postUploadUrl).not.toHaveBeenCalled();
    expect(uploadFileToUploadUrl).not.toHaveBeenCalled();
  });

  it("GIF, WebP 등 대표 포맷이 아닌 이미지는 거부한다", async () => {
    const webpFile = new File(["webp"], "profile.webp", { type: "image/webp" });

    await expect(uploadProfilePhoto(webpFile)).rejects.toMatchObject({
      name: "ProfilePhotoUploadValidationError",
      code: "invalid_type",
    } satisfies Partial<ProfilePhotoUploadValidationError>);

    expect(prepareProfileImageFile).not.toHaveBeenCalled();
    expect(postUploadUrl).not.toHaveBeenCalled();
    expect(uploadFileToUploadUrl).not.toHaveBeenCalled();
  });

  it("리사이즈 후에도 5MB를 초과하면 ProfilePhotoUploadValidationError를 던진다", async () => {
    const oversizedFile = new File(["x"], "profile-photo.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(oversizedFile, "size", {
      value: 5 * 1024 * 1024 + 1,
    });
    vi.mocked(prepareProfileImageFile).mockResolvedValue(oversizedFile);

    await expect(uploadProfilePhoto(file)).rejects.toMatchObject({
      name: "ProfilePhotoUploadValidationError",
      code: "max_size",
    } satisfies Partial<ProfilePhotoUploadValidationError>);

    expect(postUploadUrl).not.toHaveBeenCalled();
    expect(uploadFileToUploadUrl).not.toHaveBeenCalled();
  });
});
