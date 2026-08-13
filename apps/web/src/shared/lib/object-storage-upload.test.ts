import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertTrustedUploadDestination,
  type ObjectStorageUploadError,
  UntrustedUploadDestinationError,
  uploadFileToObjectStorage,
} from "#/shared/lib/object-storage-upload";
import {
  UPLOAD_CATEGORY_LOCKER_REPORT,
  UPLOAD_CATEGORY_PROFILE,
  type UploadCreateData,
} from "#/shared/model/upload-types";

const HOST = "objectstorage.ap-osaka-1.oraclecloud.com";
const NAMESPACE = "axuj36gr8lmm";
const BUCKET = "zimdugo-bucket";

const createUpload = (key: string): UploadCreateData => ({
  uploadUrl: `https://${HOST}/p/token/n/${NAMESPACE}/b/${BUCKET}/o/${key}`,
  fileUrl: `https://${HOST}/n/${NAMESPACE}/b/${BUCKET}/o/${encodeURIComponent(key)}`,
  key,
  expiresAt: "2026-08-13T10:31:10.571Z",
});

describe("object storage upload", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_UPLOAD_HOST", HOST);
    vi.stubEnv("VITE_UPLOAD_NAMESPACE", NAMESPACE);
    vi.stubEnv("VITE_UPLOAD_BUCKET", BUCKET);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each([
    [UPLOAD_CATEGORY_LOCKER_REPORT, "reports/report.jpg"],
    [UPLOAD_CATEGORY_PROFILE, "profiles/7/profile.jpg"],
  ] as const)("%s 목적지를 허용한다", (category, key) => {
    expect(() =>
      assertTrustedUploadDestination({ upload: createUpload(key), category }),
    ).not.toThrow();
  });

  it.each([
    ["hostname", { uploadUrl: "https://evil.example.com/key" }],
    [
      "namespace",
      {
        uploadUrl: `https://${HOST}/p/token/n/other/b/${BUCKET}/o/reports/report.jpg`,
      },
    ],
    [
      "bucket",
      {
        uploadUrl: `https://${HOST}/p/token/n/${NAMESPACE}/b/other/o/reports/report.jpg`,
      },
    ],
    ["key", { key: "reports/other.jpg" }],
    [
      "fileUrl",
      {
        fileUrl: `https://${HOST}/n/${NAMESPACE}/b/${BUCKET}/o/reports%2Fother.jpg`,
      },
    ],
  ])("잘못된 %s을 거부한다", (_, override) => {
    expect(() =>
      assertTrustedUploadDestination({
        upload: { ...createUpload("reports/report.jpg"), ...override },
        category: UPLOAD_CATEGORY_LOCKER_REPORT,
      }),
    ).toThrow(UntrustedUploadDestinationError);
  });

  it("category와 객체 prefix가 다르면 거부한다", () => {
    expect(() =>
      assertTrustedUploadDestination({
        upload: createUpload("profiles/7/profile.jpg"),
        category: UPLOAD_CATEGORY_LOCKER_REPORT,
      }),
    ).toThrow(UntrustedUploadDestinationError);
  });

  it("검증 후 Content-Type 헤더와 함께 PUT한다", async () => {
    const upload = createUpload("reports/report.jpg");
    const file = new File(["photo"], "report.jpg", { type: "image/jpeg" });

    await uploadFileToObjectStorage({
      upload,
      category: UPLOAD_CATEGORY_LOCKER_REPORT,
      file,
      contentType: "image/jpeg",
    });

    expect(fetch).toHaveBeenCalledWith(upload.uploadUrl, {
      method: "PUT",
      body: file,
      credentials: "omit",
      mode: "cors",
      redirect: "error",
      headers: { "Content-Type": "image/jpeg" },
    });
  });

  it("스토리지 응답 실패 상태를 보존한다", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 403 } as Response);

    await expect(
      uploadFileToObjectStorage({
        upload: createUpload("reports/report.jpg"),
        category: UPLOAD_CATEGORY_LOCKER_REPORT,
        file: new File(["photo"], "report.jpg"),
        contentType: "image/jpeg",
      }),
    ).rejects.toMatchObject({
      name: "ObjectStorageUploadError",
      status: 403,
    } satisfies Partial<ObjectStorageUploadError>);
  });
});
