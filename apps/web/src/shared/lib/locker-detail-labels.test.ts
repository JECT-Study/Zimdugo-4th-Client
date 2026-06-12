import { setLanguageTag } from "@repo/i18n";
import { describe, expect, it } from "vitest";
import {
  formatLockerOperatingHoursLabel,
  formatLockerPriceLabel,
} from "./locker-detail-labels";

describe("locker-detail-labels", () => {
  it("한국어 미제공 문구를 반환한다", () => {
    setLanguageTag("ko");

    expect(formatLockerOperatingHoursLabel()).toBe("운영시간 미제공");
    expect(formatLockerPriceLabel()).toBe("가격 미제공");
  });

  it("영어 미제공 문구를 반환한다", () => {
    setLanguageTag("en");

    expect(formatLockerOperatingHoursLabel()).toBe("Hours not provided");
    expect(formatLockerPriceLabel()).toBe("Price not provided");
  });

  it("운영시간·가격 범위를 포맷한다", () => {
    setLanguageTag("ko");

    expect(formatLockerOperatingHoursLabel("06:00", "23:00")).toBe(
      "06:00 ~ 23:00",
    );
    expect(formatLockerOperatingHoursLabel("11:00:00", "19:04:00")).toBe(
      "11:00 ~ 19:04",
    );
    expect(formatLockerPriceLabel(3000, 5000)).toBe("3,000원 ~ 5,000원");
    expect(formatLockerPriceLabel(3000)).toBe("3,000원 ~");
  });

  it("비한국어 가격 단위는 KRW로 표시한다", () => {
    setLanguageTag("en");
    expect(formatLockerPriceLabel(3000, 5000)).toBe("3,000 KRW – 5,000 KRW");

    setLanguageTag("ja");
    expect(formatLockerPriceLabel(3000, 5000)).toBe("3,000 KRW ~ 5,000 KRW");

    setLanguageTag("zh");
    expect(formatLockerPriceLabel(3000, 5000)).toBe("3,000 KRW ~ 5,000 KRW");
  });
});
