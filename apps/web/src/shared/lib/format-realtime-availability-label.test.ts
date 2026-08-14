import { setLanguageTag } from "@repo/i18n";
import { describe, expect, it } from "vitest";
import { formatRealtimeAvailabilityAsOfLabel } from "./format-updated-label";

describe("formatRealtimeAvailabilityAsOfLabel", () => {
  it.each([
    ["ko", "2026.08.14 14:19 기준"],
    ["en", "As of Aug 14, 2026, 2:19 PM"],
    ["ja", "2026/08/14 14:19時点"],
    ["zh", "截至 2026/08/14 14:19"],
    ["zh-TW", "截至 2026/08/14 14:19"],
  ] as const)("%s 로케일의 기준 시각을 표시한다", (locale, expected) => {
    setLanguageTag(locale);

    expect(
      formatRealtimeAvailabilityAsOfLabel("2026-08-14T14:19:47.013473"),
    ).toBe(expected);
  });

  it("유효하지 않은 값은 빈 문자열을 반환한다", () => {
    setLanguageTag("ko");

    expect(formatRealtimeAvailabilityAsOfLabel(undefined)).toBe("");
    expect(formatRealtimeAvailabilityAsOfLabel("invalid")).toBe("");
  });
});
