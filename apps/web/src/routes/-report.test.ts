import { describe, expect, it } from "vitest";
import { formatPriceInput } from "#/features/report/lib/sanitizePriceInput";

const sanitizeFloorNumber = (floorNumber: string) => {
  if (floorNumber.startsWith("B")) {
    const numPart = floorNumber.substring(1);
    return `B${parseInt(numPart, 10)}`;
  }
  return String(parseInt(floorNumber, 10));
};

describe("Report Page Utilities", () => {
  describe("formatPriceInput", () => {
    it("should format numbers with commas", () => {
      expect(formatPriceInput("1000")).toBe("1,000");
      expect(formatPriceInput("50000")).toBe("50,000");
    });

    it("should cap at REPORT_PRICE_MAX", () => {
      expect(formatPriceInput("1000000")).toBe("100,000");
      expect(formatPriceInput("999999")).toBe("100,000");
    });

    it("should remove non-numeric characters", () => {
      expect(formatPriceInput("1,000")).toBe("1,000");
      expect(formatPriceInput("abc123def")).toBe("123");
    });

    it("should strip leading zeros", () => {
      expect(formatPriceInput("0")).toBe("");
      expect(formatPriceInput("05")).toBe("5");
      expect(formatPriceInput("0500")).toBe("500");
    });

    it("should return empty string for empty input", () => {
      expect(formatPriceInput("")).toBe("");
    });
  });

  describe("sanitizeFloorNumber", () => {
    it("should remove leading zeros for ground floors", () => {
      expect(sanitizeFloorNumber("007")).toBe("7");
      expect(sanitizeFloorNumber("015")).toBe("15");
    });

    it("should remove leading zeros for basement floors", () => {
      expect(sanitizeFloorNumber("B007")).toBe("B7");
      expect(sanitizeFloorNumber("B015")).toBe("B15");
    });

    it("should handle single digit floors", () => {
      expect(sanitizeFloorNumber("1")).toBe("1");
      expect(sanitizeFloorNumber("B1")).toBe("B1");
    });
  });
});
