import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PresignedUploadError,
  uploadFileToPresignedUrl,
} from "#/features/report/lib/upload-file-to-presigned-url";

describe("uploadFileToPresignedUrl", () => {
  const uploadUrl =
    "https://bucket.s3.amazonaws.com/key?X-Amz-Signature=abc";
  const file = new File(["photo"], "locker-photo.jpg", {
    type: "image/jpeg",
  });

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("presigned URL로 PUT하고 Content-Type 헤더만 보낸다", async () => {
    await uploadFileToPresignedUrl({
      uploadUrl,
      file,
      contentType: "image/jpeg",
    });

    expect(fetch).toHaveBeenCalledWith(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  });

  it("S3 응답이 실패하면 PresignedUploadError를 던진다", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 403 } as Response);

    await expect(
      uploadFileToPresignedUrl({
        uploadUrl,
        file,
        contentType: "image/jpeg",
      }),
    ).rejects.toMatchObject({
      name: "PresignedUploadError",
      status: 403,
    } satisfies Partial<PresignedUploadError>);
  });
});
