import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvalidUploadCreateResponseError, createUploadUrl } from "#/features/report/api/create-upload-url";
import { UPLOAD_CATEGORY_LOCKER_REPORT } from "#/features/report/model/report-types";
import { apiClient } from "#/shared/lib/apiClient";

vi.mock("#/shared/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe("createUploadUrl", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("POST /api/v1/uploads로 presigned URL을 요청하고 data를 반환한다", async () => {
    const uploadData = {
      uploadUrl: "https://bucket.s3.amazonaws.com/key?X-Amz-Signature=abc",
      fileUrl: "https://cdn.example.com/locker-report/key.jpg",
      key: "locker-report/uuid/locker-photo.jpg",
      expiresAt: "2026-06-07T14:16:38.948Z",
    };

    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: "SUCCESS",
        message: "ok",
        status: 200,
        timestamp: "2026-06-07T14:15:38.948Z",
        data: uploadData,
      },
    });

    const payload = {
      category: UPLOAD_CATEGORY_LOCKER_REPORT,
      fileName: "locker-photo.jpg",
      contentType: "image/jpeg",
    };

    await expect(createUploadUrl(7, payload)).resolves.toEqual(uploadData);

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/uploads", payload, {
      params: { userId: 7 },
    });
  });

  it("응답 data 형식이 올바르지 않으면 InvalidUploadCreateResponseError를 던진다", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: "SUCCESS",
        message: "ok",
        status: 200,
        timestamp: "2026-06-07T14:15:38.948Z",
        data: {
          uploadUrl: "not-a-url",
          fileUrl: "https://cdn.example.com/key.jpg",
          key: "locker-report/uuid/locker-photo.jpg",
          expiresAt: "2026-06-07T14:16:38.948Z",
        },
      },
    });

    await expect(
      createUploadUrl(7, {
        category: UPLOAD_CATEGORY_LOCKER_REPORT,
        fileName: "locker-photo.jpg",
        contentType: "image/jpeg",
      }),
    ).rejects.toBeInstanceOf(InvalidUploadCreateResponseError);
  });
});
