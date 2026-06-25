import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  scrollFocusedElementIntoView,
  useReportContentFocusScroll,
} from "#/features/report/lib/use-report-content-focus-scroll";

describe("scrollFocusedElementIntoView", () => {
  it("visual viewport inset을 반영해 하단 가시 영역을 줄인다", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      paddingTop: "56px",
      paddingBottom: "100px",
    } as CSSStyleDeclaration);

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: 500,
        offsetTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    const container = document.createElement("main");
    Object.defineProperty(container, "scrollTop", {
      writable: true,
      value: 0,
    });
    const input = document.createElement("input");
    container.appendChild(input);
    document.body.appendChild(container);

    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 700,
      left: 0,
      right: 300,
      width: 300,
      height: 700,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(input, "getBoundingClientRect").mockReturnValue({
      top: 620,
      bottom: 650,
      left: 0,
      right: 300,
      width: 300,
      height: 30,
      x: 0,
      y: 620,
      toJSON: () => ({}),
    });

    scrollFocusedElementIntoView(container, input);

    expect(container.scrollTop).toBeGreaterThan(0);
  });
});

describe("useReportContentFocusScroll", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("언마운트 시 예약된 requestAnimationFrame을 취소한다", () => {
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback(0);
        return 42;
      });

    const contentRef = createRef<HTMLElement>();
    const container = document.createElement("main");
    const input = document.createElement("input");
    container.appendChild(input);
    document.body.appendChild(container);
    contentRef.current = container;

    const { unmount } = renderHook(() =>
      useReportContentFocusScroll(contentRef, true),
    );

    act(() => {
      input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    expect(requestAnimationFrame).toHaveBeenCalled();

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it("포커스 시 document 스크롤을 초기화하고 컨테이너 안에서만 보이게 한다", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      paddingTop: "56px",
      paddingBottom: "100px",
    } as CSSStyleDeclaration);

    const contentRef = createRef<HTMLElement>();
    const container = document.createElement("main");
    Object.defineProperty(container, "scrollTop", {
      writable: true,
      value: 0,
    });
    const input = document.createElement("input");
    container.appendChild(input);
    document.body.appendChild(container);
    contentRef.current = container;

    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 400,
      left: 0,
      right: 300,
      width: 300,
      height: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(input, "getBoundingClientRect").mockReturnValue({
      top: 500,
      bottom: 530,
      left: 0,
      right: 300,
      width: 300,
      height: 30,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    });

    renderHook(() => useReportContentFocusScroll(contentRef, true));

    act(() => {
      input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(container.scrollTop).toBeGreaterThan(0);
  });

  it("visualViewport 변경 시 포커스된 요소를 다시 스크롤한다", () => {
    vi.useFakeTimers();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      paddingTop: "0px",
      paddingBottom: "0px",
    } as CSSStyleDeclaration);

    const viewportListeners = new Map<string, EventListener>();
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: 800,
        offsetTop: 0,
        addEventListener: vi.fn((type: string, listener: EventListener) => {
          viewportListeners.set(type, listener);
        }),
        removeEventListener: vi.fn(),
      },
    });

    const contentRef = createRef<HTMLElement>();
    const container = document.createElement("main");
    Object.defineProperty(container, "scrollTop", {
      writable: true,
      value: 0,
    });
    const input = document.createElement("input");
    container.appendChild(input);
    document.body.appendChild(container);
    contentRef.current = container;

    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 400,
      left: 0,
      right: 300,
      width: 300,
      height: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(input, "getBoundingClientRect").mockReturnValue({
      top: 500,
      bottom: 530,
      left: 0,
      right: 300,
      width: 300,
      height: 30,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    });

    renderHook(() => useReportContentFocusScroll(contentRef, true));

    act(() => {
      input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    const initialScrollTop = container.scrollTop;
    expect(initialScrollTop).toBeGreaterThan(0);

    Object.defineProperty(container, "scrollTop", {
      writable: true,
      value: 0,
    });

    act(() => {
      viewportListeners.get("resize")?.(new Event("resize"));
    });

    expect(scrollTo).toHaveBeenCalled();
    expect(container.scrollTop).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  it("컨테이너 밖 포커스는 무시한다", () => {
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(1);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    const contentRef = createRef<HTMLElement>();
    const container = document.createElement("main");
    const insideInput = document.createElement("input");
    const outsideInput = document.createElement("input");
    container.appendChild(insideInput);
    document.body.appendChild(container);
    document.body.appendChild(outsideInput);
    contentRef.current = container;

    renderHook(() => useReportContentFocusScroll(contentRef, true));

    act(() => {
      outsideInput.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("enabled가 false이면 포커스 핸들러를 등록하지 않는다", () => {
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(1);

    const contentRef = createRef<HTMLElement>();
    const container = document.createElement("main");
    const input = document.createElement("input");
    container.appendChild(input);
    document.body.appendChild(container);
    contentRef.current = container;

    renderHook(() => useReportContentFocusScroll(contentRef, false));

    act(() => {
      input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
