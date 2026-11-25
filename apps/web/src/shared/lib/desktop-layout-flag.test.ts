import { afterEach, describe, expect, it } from "vitest";
import {
  DESKTOP_LAYOUT_FLAG_SCRIPT,
  isDesktopLayoutFlagOn,
} from "./desktop-layout-flag";

const runFlagScript = (search: string) => {
  window.history.replaceState(null, "", `/${search}`);
  // 인라인으로 심는 스크립트를 그대로 돌려 본다.
  new Function(DESKTOP_LAYOUT_FLAG_SCRIPT)();
};

describe("데스크톱 레이아웃 플래그", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-desktop-layout");
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("환경 변수가 없으면 기본은 꺼져 있다", () => {
    runFlagScript("");
    expect(isDesktopLayoutFlagOn()).toBe(false);
  });

  it("?desktop=1 로 켜면 다음 방문에도 기억한다", () => {
    runFlagScript("?desktop=1");
    expect(isDesktopLayoutFlagOn()).toBe(true);

    document.documentElement.removeAttribute("data-desktop-layout");
    runFlagScript("");
    expect(isDesktopLayoutFlagOn()).toBe(true);
  });

  it("저장소가 막혀 있어도 주소의 값은 적용한다", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("denied", "SecurityError");
      },
    });
    try {
      runFlagScript("?desktop=1");
      expect(isDesktopLayoutFlagOn()).toBe(true);
    } finally {
      if (original) {
        Object.defineProperty(window, "localStorage", original);
      }
    }
  });

  it("?desktop=0 으로 다시 끈다", () => {
    runFlagScript("?desktop=1");
    document.documentElement.removeAttribute("data-desktop-layout");
    runFlagScript("?desktop=0");
    expect(isDesktopLayoutFlagOn()).toBe(false);
  });
});
