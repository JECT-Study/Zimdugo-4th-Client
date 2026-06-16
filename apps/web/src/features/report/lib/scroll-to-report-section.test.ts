import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getReportSectionScrollBehavior,
  REPORT_CONTENT_SCROLL_CONTAINER_ATTR,
  scrollToReportSection,
} from "#/features/report/lib/scroll-to-report-section";

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

describe("scrollToReportSection", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("스크롤 컨테이너가 있으면 scrollIntoView 대신 컨테이너를 스크롤한다", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
      const el = element as HTMLElement;
      if (el.tagName === "MAIN") {
        return { paddingTop: "0px" } as CSSStyleDeclaration;
      }
      if (el.tagName === "SECTION") {
        return { scrollMarginTop: "0px" } as CSSStyleDeclaration;
      }
      return {
        paddingTop: "0px",
        scrollMarginTop: "0px",
      } as CSSStyleDeclaration;
    });

    const scrollContainer = document.createElement("main");
    scrollContainer.setAttribute(REPORT_CONTENT_SCROLL_CONTAINER_ATTR, "");
    Object.defineProperty(scrollContainer, "scrollTop", {
      writable: true,
      value: 100,
    });
    scrollContainer.scrollTo = vi.fn();

    const section = document.createElement("section");
    section.dataset.section = "price";
    scrollContainer.appendChild(section);
    document.body.appendChild(scrollContainer);

    vi.spyOn(scrollContainer, "getBoundingClientRect").mockReturnValue({
      top: 0,
      left: 0,
      right: 0,
      bottom: 400,
      width: 0,
      height: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      top: 80,
      left: 0,
      right: 0,
      bottom: 120,
      width: 0,
      height: 40,
      x: 0,
      y: 80,
      toJSON: () => ({}),
    });
    const scrollIntoView = vi.fn();
    section.scrollIntoView = scrollIntoView;

    scrollToReportSection("price");

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      top: 180,
      behavior: "smooth",
    });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
