import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * 플래그 모듈은 불러올 때 환경 변수 값을 스크립트 문자열에 박아 넣는다.
 * DOM·저장소를 정리해도 그 값은 남으므로, 사례마다 환경을 고정한 뒤 모듈을 새로 불러온다.
 */
const loadFlagModule = async (envValue: "true" | "false") => {
  vi.stubEnv("VITE_FEATURE_DESKTOP_LAYOUT", envValue);
  vi.resetModules();
  return import("./desktop-layout-flag");
};

const runFlagScript = (script: string, search: string) => {
  window.history.replaceState(null, "", `/${search}`);
  // 인라인으로 심는 스크립트를 그대로 돌려 본다.
  new Function(script)();
};

describe("데스크톱 레이아웃 플래그", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    document.documentElement.removeAttribute("data-desktop-layout");
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("환경 변수가 꺼져 있으면 기본은 꺼져 있다", async () => {
    const { DESKTOP_LAYOUT_FLAG_SCRIPT, isDesktopLayoutFlagOn } =
      await loadFlagModule("false");

    runFlagScript(DESKTOP_LAYOUT_FLAG_SCRIPT, "");
    expect(isDesktopLayoutFlagOn()).toBe(false);
  });

  it("환경 변수가 켜져 있으면 기본으로 켜진다", async () => {
    const { DESKTOP_LAYOUT_FLAG_SCRIPT, isDesktopLayoutFlagOn } =
      await loadFlagModule("true");

    runFlagScript(DESKTOP_LAYOUT_FLAG_SCRIPT, "");
    expect(isDesktopLayoutFlagOn()).toBe(true);
  });

  it("환경 변수가 켜져 있어도 ?desktop=0 이면 끈다", async () => {
    const { DESKTOP_LAYOUT_FLAG_SCRIPT, isDesktopLayoutFlagOn } =
      await loadFlagModule("true");

    runFlagScript(DESKTOP_LAYOUT_FLAG_SCRIPT, "?desktop=0");
    expect(isDesktopLayoutFlagOn()).toBe(false);
  });

  it("?desktop=1 로 켜면 다음 방문에도 기억한다", async () => {
    const { DESKTOP_LAYOUT_FLAG_SCRIPT, isDesktopLayoutFlagOn } =
      await loadFlagModule("false");

    runFlagScript(DESKTOP_LAYOUT_FLAG_SCRIPT, "?desktop=1");
    expect(isDesktopLayoutFlagOn()).toBe(true);

    document.documentElement.removeAttribute("data-desktop-layout");
    runFlagScript(DESKTOP_LAYOUT_FLAG_SCRIPT, "");
    expect(isDesktopLayoutFlagOn()).toBe(true);
  });

  it("저장소가 막혀 있어도 주소의 값은 적용한다", async () => {
    const { DESKTOP_LAYOUT_FLAG_SCRIPT, isDesktopLayoutFlagOn } =
      await loadFlagModule("false");
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("denied", "SecurityError");
      },
    });
    try {
      runFlagScript(DESKTOP_LAYOUT_FLAG_SCRIPT, "?desktop=1");
      expect(isDesktopLayoutFlagOn()).toBe(true);
    } finally {
      if (original) {
        Object.defineProperty(window, "localStorage", original);
      }
    }
  });

  it("?desktop=0 으로 다시 끈다", async () => {
    const { DESKTOP_LAYOUT_FLAG_SCRIPT, isDesktopLayoutFlagOn } =
      await loadFlagModule("false");

    runFlagScript(DESKTOP_LAYOUT_FLAG_SCRIPT, "?desktop=1");
    document.documentElement.removeAttribute("data-desktop-layout");
    runFlagScript(DESKTOP_LAYOUT_FLAG_SCRIPT, "?desktop=0");
    expect(isDesktopLayoutFlagOn()).toBe(false);
  });
});
