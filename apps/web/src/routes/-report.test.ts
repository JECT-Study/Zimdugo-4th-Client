import { describe, expect, it } from "vitest";
import { formatPriceInput } from "#/features/report/lib/sanitizePriceInput";

const sanitizeFloorNumber = (floorNumber: string) => {
  if (floorNumber.startsWith("B")) {
    const numPart = floorNumber.substring(1);
    return `B${parseInt(numPart, 10)}`;
  }
  return String(parseInt(floorNumber, 10));
};

describe("신고 화면 유틸리티", () => {
  describe("formatPriceInput", () => {
    it("숫자에 천 단위 쉼표를 넣는다", () => {
      expect(formatPriceInput("1000")).toBe("1,000");
      expect(formatPriceInput("50000")).toBe("50,000");
    });

    it("REPORT_PRICE_MAX 를 넘지 않게 자른다", () => {
      expect(formatPriceInput("1000000")).toBe("100,000");
      expect(formatPriceInput("999999")).toBe("100,000");
    });

    it("숫자가 아닌 문자를 걷어낸다", () => {
      expect(formatPriceInput("1,000")).toBe("1,000");
      expect(formatPriceInput("abc123def")).toBe("123");
    });

    it("앞에 붙은 0 을 걷어낸다", () => {
      expect(formatPriceInput("0")).toBe("");
      expect(formatPriceInput("05")).toBe("5");
      expect(formatPriceInput("0500")).toBe("500");
    });

    it("입력이 비면 빈 문자열을 준다", () => {
      expect(formatPriceInput("")).toBe("");
    });
  });

  describe("sanitizeFloorNumber", () => {
    it("지상층의 앞선 0 을 걷어낸다", () => {
      expect(sanitizeFloorNumber("007")).toBe("7");
      expect(sanitizeFloorNumber("015")).toBe("15");
    });

    it("지하층의 앞선 0 을 걷어낸다", () => {
      expect(sanitizeFloorNumber("B007")).toBe("B7");
      expect(sanitizeFloorNumber("B015")).toBe("B15");
    });

    it("한 자리 층수를 그대로 다룬다", () => {
      expect(sanitizeFloorNumber("1")).toBe("1");
      expect(sanitizeFloorNumber("B1")).toBe("B1");
    });
  });
});
