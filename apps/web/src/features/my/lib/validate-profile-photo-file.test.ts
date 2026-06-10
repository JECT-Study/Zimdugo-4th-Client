import { describe, expect, it } from "vitest";
import { MAX_REPORT_PHOTO_SIZE_BYTES } from "#/features/report/model/report-types";
import {
  isAcceptedProfilePhotoFile,
  resolveProfilePhotoContentType,
  validateProfilePhotoFile,
} from "#/features/my/lib/validate-profile-photo-file";

describe("validateProfilePhotoFile", () => {
  it("JPG 파일을 허용한다", () => {
    const file = new File(["photo"], "profile.jpg", { type: "image/jpeg" });

    expect(validateProfilePhotoFile(file)).toEqual({ ok: true });
  });

  it("PNG 파일을 허용한다", () => {
    const file = new File(["photo"], "profile.png", { type: "image/png" });

    expect(validateProfilePhotoFile(file)).toEqual({ ok: true });
  });

  it("GIF, WebP, HEIC 등 다른 이미지 포맷은 거부한다", () => {
    const unsupportedFiles = [
      new File(["gif"], "profile.gif", { type: "image/gif" }),
      new File(["webp"], "profile.webp", { type: "image/webp" }),
      new File(["heic"], "profile.heic", { type: "image/heic" }),
      new File(["svg"], "profile.svg", { type: "image/svg+xml" }),
    ];

    for (const file of unsupportedFiles) {
      expect(isAcceptedProfilePhotoFile(file)).toBe(false);
      expect(validateProfilePhotoFile(file)).toEqual({
        ok: false,
        error: "invalid_type",
      });
    }
  });

  it("5MB를 초과하면 max_size 오류를 반환한다", () => {
    const file = new File(["x"], "profile.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", {
      value: MAX_REPORT_PHOTO_SIZE_BYTES + 1,
    });

    expect(validateProfilePhotoFile(file)).toEqual({
      ok: false,
      error: "max_size",
    });
  });

  it("MIME 타입이 없어도 확장자로 content type을 추론한다", () => {
    const file = new File(["photo"], "profile.jpeg", { type: "" });

    expect(resolveProfilePhotoContentType(file)).toBe("image/jpeg");
  });
});
