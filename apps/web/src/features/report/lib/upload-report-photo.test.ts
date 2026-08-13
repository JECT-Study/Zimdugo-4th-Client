import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type ReportPhotoUploadValidationError,
  uploadReportPhoto,
} from "#/features/report/lib/upload-report-photo";
import { postUploadUrl } from "#/shared/api/uploads";
import { uploadFileToUploadUrl } from "#/shared/lib/upload-file-to-upload-url";
import { UPLOAD_CATEGORY_LOCKER_REPORT } from "#/shared/model/upload-types";

vi.mock("#/shared/api/uploads", () => ({
  postUploadUrl: vi.fn(),
}));

vi.mock("#/shared/lib/upload-file-to-upload-url", () => ({
  uploadFileToUploadUrl: vi.fn(),
}));

describe("uploadReportPhoto", () => {
  const file = new File(["photo"], "locker-photo.jpg", { type: "image/jpeg" });

  beforeEach(() => {
    vi.mocked(postUploadUrl).mockReset();
    vi.mocked(uploadFileToUploadUrl).mockReset();
  });

  it("LOCKER_REPORT 업로드 URL을 발급받아 파일을 업로드한다", async () => {
    vi.mocked(postUploadUrl).mockResolvedValue({
      uploadUrl:
        "https://objectstorage.ap-osaka-1.oraclecloud.com/p/token/n/axuj36gr8lmm/b/zimdugo-bucket/o/reports/photo.jpg",
      fileUrl:
        "https://objectstorage.ap-osaka-1.oraclecloud.com/n/axuj36gr8lmm/b/zimdugo-bucket/o/reports%2Fphoto.jpg",
      key: "reports/photo.jpg",
      expiresAt: "2026-06-07T14:16:38.948Z",
    });
    vi.mocked(uploadFileToUploadUrl).mockResolvedValue(undefined);

    await expect(uploadReportPhoto(file)).resolves.toBe(
      "https://objectstorage.ap-osaka-1.oraclecloud.com/n/axuj36gr8lmm/b/zimdugo-bucket/o/reports%2Fphoto.jpg",
    );

    expect(postUploadUrl).toHaveBeenCalledWith({
      category: UPLOAD_CATEGORY_LOCKER_REPORT,
      fileName: "locker-photo.jpg",
      contentType: "image/jpeg",
      contentLength: file.size,
    });
    expect(uploadFileToUploadUrl).toHaveBeenCalledWith({
      upload: expect.objectContaining({ key: "reports/photo.jpg" }),
      category: UPLOAD_CATEGORY_LOCKER_REPORT,
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
    expect(uploadFileToUploadUrl).not.toHaveBeenCalled();
  });
});
