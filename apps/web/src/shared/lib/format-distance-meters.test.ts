import { describe, expect, it } from "vitest";
import { formatDistanceMeters } from "./format-distance-meters";

describe("formatDistanceMeters", () => {
  it("미터와 킬로미터 단위를 포맷한다", () => {
    expect(formatDistanceMeters(16)).toBe("16m");
    expect(formatDistanceMeters(238)).toBe("238m");
    expect(formatDistanceMeters(2438)).toBe("2.4km");
    expect(formatDistanceMeters(12000)).toBe("12km");
  });
});
