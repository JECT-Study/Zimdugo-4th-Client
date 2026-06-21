import { describe, expect, it } from "vitest";
import { isReportSubmitEnabled } from "./useReportForm";

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
