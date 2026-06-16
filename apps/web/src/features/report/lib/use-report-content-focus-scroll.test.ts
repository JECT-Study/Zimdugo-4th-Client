import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReportContentFocusScroll } from "#/features/report/lib/use-report-content-focus-scroll";

describe("useReportContentFocusScroll", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("언마운트 시 예약된 requestAnimationFrame을 취소한다", () => {
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(42);

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

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
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
});
