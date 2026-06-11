import { describe, expect, it } from "vitest";
import { requiresExifConsent } from "./requires-exif-consent";

describe("requiresExifConsent", () => {
  it("사진이 없으면 EXIF 동의가 필요하지 않다", () => {
    expect(
      requiresExifConsent({
        imageUrl: null,
        uploadedImageCount: 0,
        hasSelectedPhotoFile: false,
      }),
    ).toBe(false);
  });

  it("미리보기가 있으면 EXIF 동의가 필요하다", () => {
    expect(
      requiresExifConsent({
        imageUrl: null,
        uploadedImageCount: 1,
        hasSelectedPhotoFile: false,
      }),
    ).toBe(true);
  });

  it("선택 파일이 있으면 EXIF 동의가 필요하다", () => {
    expect(
      requiresExifConsent({
        imageUrl: null,
        uploadedImageCount: 0,
        hasSelectedPhotoFile: true,
      }),
    ).toBe(true);
  });

  it("저장된 imageUrl이 있으면 EXIF 동의가 필요하다", () => {
    expect(
      requiresExifConsent({
        imageUrl: "https://example.com/photo.jpg",
        uploadedImageCount: 0,
        hasSelectedPhotoFile: false,
      }),
    ).toBe(true);
  });
});
