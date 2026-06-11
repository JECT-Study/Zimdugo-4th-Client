import { afterEach, describe, expect, it, vi } from "vitest";
import { getReportSectionScrollBehavior } from "#/features/report/lib/scroll-to-report-section";

describe("getReportSectionScrollBehavior", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers-reduced-motion이면 auto를 반환한다", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    });

    expect(getReportSectionScrollBehavior()).toBe("auto");
  });

  it("prefers-reduced-motion이 아니면 smooth를 반환한다", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });

    expect(getReportSectionScrollBehavior()).toBe("smooth");
  });
});
