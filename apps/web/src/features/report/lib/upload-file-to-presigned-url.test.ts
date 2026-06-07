import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PresignedUploadError,
  UntrustedPresignedUploadUrlError,
  assertTrustedPresignedUploadUrl,
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
      credentials: "omit",
      mode: "cors",
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  });

  it("신뢰할 수 없는 uploadUrl이면 fetch 전에 거부한다", async () => {
    await expect(
      uploadFileToPresignedUrl({
        uploadUrl: "https://evil.example.com/key",
        file,
        contentType: "image/jpeg",
      }),
    ).rejects.toBeInstanceOf(UntrustedPresignedUploadUrlError);

    expect(fetch).not.toHaveBeenCalled();
  });

  it("S3 호스트명 부분 일치 우회 URL은 거부한다", () => {
    for (const uploadUrl of [
      "https://evil.s3-attacker.com/key",
      "https://s3.amazonaws.com.evil.com/key",
    ]) {
      expect(() => assertTrustedPresignedUploadUrl(uploadUrl)).toThrow(
        UntrustedPresignedUploadUrlError,
      );
    }
  });

  it("정상 S3 호스트명은 허용한다", () => {
    for (const uploadUrl of [
      "https://bucket.s3.amazonaws.com/key",
      "https://bucket.s3.us-east-1.amazonaws.com/key",
      "https://s3.amazonaws.com/bucket/key",
      "https://s3.us-west-2.amazonaws.com/bucket/key",
    ]) {
      expect(() => assertTrustedPresignedUploadUrl(uploadUrl)).not.toThrow();
    }
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
