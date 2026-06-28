import { languageTag, setLanguageTag } from "@repo/i18n";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resolveReportStatusDisplay } from "./resolve-report-status";

describe("resolveReportStatusDisplay", () => {
  let initialLanguage: ReturnType<typeof languageTag>;

  beforeAll(() => {
    initialLanguage = languageTag();
    setLanguageTag("ko", { reload: false });
  });

  afterAll(() => {
    setLanguageTag(initialLanguage, { reload: false });
  });

  it("SUBMITTED만 검토 중 pending 배지로 매핑한다", () => {
    expect(resolveReportStatusDisplay("SUBMITTED")).toEqual({
      variant: "pending",
      label: "검토 중",
    });
    expect(resolveReportStatusDisplay("submitted")).toEqual({
      variant: "pending",
      label: "검토 중",
    });
  });

  it("승인·반려 상태를 각각 approved, rejected로 매핑한다", () => {
    expect(resolveReportStatusDisplay("APPROVED")).toEqual({
      variant: "approved",
      label: "승인",
    });
    expect(resolveReportStatusDisplay("REJECTED")).toEqual({
      variant: "rejected",
      label: "반려",
    });
  });

  it("빈 값이나 알 수 없는 상태는 배지를 숨긴다", () => {
    expect(resolveReportStatusDisplay(null)).toBeNull();
    expect(resolveReportStatusDisplay("")).toBeNull();
    expect(resolveReportStatusDisplay("UNDER_REVIEW")).toBeNull();
    expect(resolveReportStatusDisplay("UNKNOWN")).toBeNull();
  });
});
