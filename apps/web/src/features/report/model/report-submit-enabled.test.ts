import { describe, expect, it } from "vitest";
import {
  isReportOptionalFieldsComplete,
  isReportSubmitEnabled,
} from "./useReportForm";

describe("isReportSubmitEnabled", () => {
  it("requires EXIF consent before enabling submit", () => {
    expect(
      isReportSubmitEnabled({
        areRequiredFieldsComplete: true,
        shouldRequireExifConsent: true,
        locationConsentAgreed: false,
      }),
    ).toBe(false);

    expect(
      isReportSubmitEnabled({
        areRequiredFieldsComplete: true,
        shouldRequireExifConsent: true,
        locationConsentAgreed: true,
      }),
    ).toBe(true);
  });

  it("keeps submit disabled until required fields are complete", () => {
    expect(
      isReportSubmitEnabled({
        areRequiredFieldsComplete: false,
        shouldRequireExifConsent: false,
        locationConsentAgreed: false,
      }),
    ).toBe(false);
  });
});

describe("isReportOptionalFieldsComplete", () => {
  it("선택 입력값이 모두 채워진 경우에만 true를 반환한다", () => {
    expect(
      isReportOptionalFieldsComplete({
        isFree: false,
        minPrice: 1000,
        maxPrice: 3000,
        startTime: "09:00",
        endTime: "18:00",
        additionalInfo: "2번 출구 옆",
        imageUrl: null,
        uploadedImageCount: 1,
      }),
    ).toBe(true);

    expect(
      isReportOptionalFieldsComplete({
        isFree: false,
        minPrice: 1000,
        maxPrice: null,
        startTime: "09:00",
        endTime: "18:00",
        additionalInfo: "2번 출구 옆",
        imageUrl: null,
        uploadedImageCount: 1,
      }),
    ).toBe(false);
  });

  it("모름 가격은 응답된 선택값으로 보고 나머지 선택값 완성을 확인한다", () => {
    expect(
      isReportOptionalFieldsComplete({
        isFree: null,
        minPrice: null,
        maxPrice: null,
        startTime: "00:00",
        endTime: "00:00",
        additionalInfo: "지하 통로 안쪽",
        imageUrl: "https://cdn.example.com/locker.jpg",
        uploadedImageCount: 0,
      }),
    ).toBe(true);

    expect(
      isReportOptionalFieldsComplete({
        isFree: null,
        minPrice: null,
        maxPrice: null,
        startTime: "00:00",
        endTime: "00:00",
        additionalInfo: "",
        imageUrl: "https://cdn.example.com/locker.jpg",
        uploadedImageCount: 0,
      }),
    ).toBe(false);
  });
});
