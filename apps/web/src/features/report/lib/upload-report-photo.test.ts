import { beforeEach, describe, expect, it, vi } from "vitest";
import { postUploadUrl } from "#/features/report/api/create-upload-url";
import { uploadFileToPresignedUrl } from "#/features/report/lib/upload-file-to-presigned-url";
import {
  ReportPhotoUploadValidationError,
  uploadReportPhoto,
} from "#/features/report/lib/upload-report-photo";
import { UPLOAD_CATEGORY_LOCKER_REPORT } from "#/features/report/model/report-types";

vi.mock("#/features/report/api/create-upload-url", () => ({
  postUploadUrl: vi.fn(),
}));

vi.mock("#/features/report/lib/upload-file-to-presigned-url", () => ({
  uploadFileToPresignedUrl: vi.fn(),
}));

describe("uploadReportPhoto", () => {
  const file = new File(["photo"], "locker-photo.jpg", { type: "image/jpeg" });

  beforeEach(() => {
    vi.mocked(postUploadUrl).mockReset();
    vi.mocked(uploadFileToPresignedUrl).mockReset();
  });

  it("LOCKER_REPORT presigned URL 발급 후 S3 업로드하고 fileUrl을 반환한다", async () => {
    vi.mocked(postUploadUrl).mockResolvedValue({
      uploadUrl: "https://bucket.s3.amazonaws.com/key?X-Amz-Signature=abc",
      fileUrl: "https://cdn.example.com/locker-report/key.jpg",
      key: "locker-report/uuid/locker-photo.jpg",
      expiresAt: "2026-06-07T14:16:38.948Z",
    });
    vi.mocked(uploadFileToPresignedUrl).mockResolvedValue(undefined);

    await expect(uploadReportPhoto(file)).resolves.toBe(
      "https://cdn.example.com/locker-report/key.jpg",
    );

    expect(postUploadUrl).toHaveBeenCalledWith({
      category: UPLOAD_CATEGORY_LOCKER_REPORT,
      fileName: "locker-photo.jpg",
      contentType: "image/jpeg",
    });
    expect(uploadFileToPresignedUrl).toHaveBeenCalledWith({
      uploadUrl: "https://bucket.s3.amazonaws.com/key?X-Amz-Signature=abc",
      file,
      contentType: "image/jpeg",
    });
  });

  it("허용되지 않는 파일이면 ReportPhotoUploadValidationError를 던진다", async () => {
    const invalidFile = new File(["doc"], "document.hwp", {
      type: "application/x-hwp",
    });

    await expect(uploadReportPhoto(invalidFile)).rejects.toMatchObject({
      name: "ReportPhotoUploadValidationError",
      code: "invalid_type",
    } satisfies Partial<ReportPhotoUploadValidationError>);

    expect(postUploadUrl).not.toHaveBeenCalled();
    expect(uploadFileToPresignedUrl).not.toHaveBeenCalled();
  });
});
