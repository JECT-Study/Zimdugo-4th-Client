import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type ReportPhotoUploadValidationError,
  uploadReportPhoto,
} from "#/features/report/lib/upload-report-photo";
import { postUploadUrl } from "#/shared/api/uploads";
import { uploadFileToObjectStorage } from "#/shared/lib/object-storage-upload";
import { UPLOAD_CATEGORY_LOCKER_REPORT } from "#/shared/model/upload-types";

vi.mock("#/shared/api/uploads", () => ({
  postUploadUrl: vi.fn(),
}));

vi.mock("#/shared/lib/object-storage-upload", () => ({
  uploadFileToObjectStorage: vi.fn(),
}));

describe("uploadReportPhoto", () => {
  const file = new File(["photo"], "locker-photo.jpg", { type: "image/jpeg" });

  beforeEach(() => {
    vi.mocked(postUploadUrl).mockReset();
    vi.mocked(uploadFileToObjectStorage).mockReset();
  });

  it("LOCKER_REPORT URL 발급 후 오브젝트 스토리지에 업로드한다", async () => {
    vi.mocked(postUploadUrl).mockResolvedValue({
      uploadUrl:
        "https://objectstorage.ap-osaka-1.oraclecloud.com/p/token/n/axuj36gr8lmm/b/zimdugo-bucket/o/reports/photo.jpg",
      fileUrl:
        "https://objectstorage.ap-osaka-1.oraclecloud.com/n/axuj36gr8lmm/b/zimdugo-bucket/o/reports%2Fphoto.jpg",
      key: "reports/photo.jpg",
      expiresAt: "2026-06-07T14:16:38.948Z",
    });
    vi.mocked(uploadFileToObjectStorage).mockResolvedValue(undefined);

    await expect(uploadReportPhoto(file)).resolves.toBe(
      "https://objectstorage.ap-osaka-1.oraclecloud.com/n/axuj36gr8lmm/b/zimdugo-bucket/o/reports%2Fphoto.jpg",
    );

    expect(postUploadUrl).toHaveBeenCalledWith({
      category: UPLOAD_CATEGORY_LOCKER_REPORT,
      fileName: "locker-photo.jpg",
      contentType: "image/jpeg",
      contentLength: file.size,
    });
    expect(uploadFileToObjectStorage).toHaveBeenCalledWith({
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
    expect(uploadFileToObjectStorage).not.toHaveBeenCalled();
  });
});
