import { setLanguageTag } from "@repo/i18n";
import { describe, expect, it } from "vitest";
import {
  formatLastUpdatedLabel,
  formatUpdatedLabel,
} from "./format-updated-label";

const NOW = new Date("2026-06-07T12:00:00.000Z");

describe("formatUpdatedLabel", () => {
  it("5분 이내는 방금 업데이트로 표시한다", () => {
    setLanguageTag("ko");

    expect(
      formatUpdatedLabel("2026-06-07T11:56:00.000Z", NOW),
    ).toBe("방금 업데이트");
    expect(
      formatUpdatedLabel("2026-06-07T11:55:01.000Z", NOW),
    ).toBe("방금 업데이트");
  });

  it("5분 이상 1시간 미만은 분 단위 상대 시간을 표시한다", () => {
    setLanguageTag("ko");

    expect(
      formatUpdatedLabel("2026-06-07T11:54:59.000Z", NOW),
    ).toBe("5분 전 업데이트");
    expect(
      formatUpdatedLabel("2026-06-07T11:01:00.000Z", NOW),
    ).toBe("59분 전 업데이트");
  });

  it("1시간 이상 1일 미만은 시간 단위 상대 시간을 표시한다", () => {
    setLanguageTag("ko");

    expect(
      formatUpdatedLabel("2026-06-07T10:00:00.000Z", NOW),
    ).toBe("2시간 전 업데이트");
  });

  it("1일 이상 30일 미만은 일 단위 상대 시간을 표시한다", () => {
    setLanguageTag("ko");

    expect(
      formatUpdatedLabel("2026-06-01T12:00:00.000Z", NOW),
    ).toBe("6일 전 업데이트");
    expect(
      formatUpdatedLabel("2026-05-09T12:00:00.000Z", NOW),
    ).toBe("29일 전 업데이트");
  });

  it("30일 이상 365일 미만은 개월 단위 상대 시간을 표시한다", () => {
    setLanguageTag("ko");

    expect(
      formatUpdatedLabel("2026-05-08T12:00:00.000Z", NOW),
    ).toBe("1개월 전 업데이트");
    expect(
      formatUpdatedLabel("2025-07-07T12:00:00.000Z", NOW),
    ).toBe("11개월 전 업데이트");
  });

  it("365일 이상은 년 단위 상대 시간을 표시한다", () => {
    setLanguageTag("ko");

    expect(
      formatUpdatedLabel("2025-06-07T12:00:00.000Z", NOW),
    ).toBe("1년 전 업데이트");
    expect(
      formatUpdatedLabel("2024-06-07T12:00:00.000Z", NOW),
    ).toBe("2년 전 업데이트");
  });

  it("유효하지 않은 값은 빈 문자열을 반환한다", () => {
    setLanguageTag("ko");

    expect(formatUpdatedLabel(undefined, NOW)).toBe("");
    expect(formatUpdatedLabel("invalid", NOW)).toBe("");
  });
});

describe("formatLastUpdatedLabel", () => {
  it("풀 시트용 최근 업데이트 라벨을 시·분까지 표시한다", () => {
    setLanguageTag("ko");

    expect(formatLastUpdatedLabel("2026-05-16T16:25:00")).toBe(
      "최근 업데이트 2026-05-16 16:25",
    );
  });

  it("유효하지 않은 값은 빈 문자열을 반환한다", () => {
    setLanguageTag("ko");

    expect(formatLastUpdatedLabel(undefined)).toBe("");
    expect(formatLastUpdatedLabel("invalid")).toBe("");
  });
});
