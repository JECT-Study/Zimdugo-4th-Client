import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InvalidUploadCreateResponseError,
  postUploadUrl,
} from "#/shared/api/uploads";
import { apiClient } from "#/shared/lib/apiClient";
import { UPLOAD_CATEGORY_LOCKER_REPORT } from "#/shared/model/upload-types";

vi.mock("#/shared/lib/apiClient", () => ({
  apiClient: { post: vi.fn() },
}));

describe("postUploadUrl", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("업로드 URL을 요청하고 검증된 응답 데이터를 반환한다", async () => {
    const uploadData = {
      uploadUrl:
        "https://objectstorage.ap-osaka-1.oraclecloud.com/p/token/n/namespace/b/bucket/o/reports/photo.jpg",
      fileUrl:
        "https://objectstorage.ap-osaka-1.oraclecloud.com/n/namespace/b/bucket/o/reports%2Fphoto.jpg",
      key: "reports/photo.jpg",
      expiresAt: "2026-08-13T10:31:10.571Z",
    };
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { data: uploadData },
    });

    const payload = {
      category: UPLOAD_CATEGORY_LOCKER_REPORT,
      fileName: "photo.jpg",
      contentType: "image/jpeg",
      contentLength: 1024,
    };

    await expect(postUploadUrl(payload)).resolves.toEqual(uploadData);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/uploads", payload);
  });

  it("응답 데이터 형식이 올바르지 않으면 거부한다", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { data: { uploadUrl: "not-a-url" } },
    });

    await expect(
      postUploadUrl({
        category: UPLOAD_CATEGORY_LOCKER_REPORT,
        fileName: "photo.jpg",
        contentType: "image/jpeg",
        contentLength: 1024,
      }),
    ).rejects.toBeInstanceOf(InvalidUploadCreateResponseError);
  });
});
