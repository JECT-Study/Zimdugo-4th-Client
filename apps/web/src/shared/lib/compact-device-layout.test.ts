import { afterEach, describe, expect, it } from "vitest";
import {
  COMPACT_DEVICE_LAYOUT_SCRIPT,
  syncCompactDeviceAttribute,
} from "./compact-device-layout";

const ATTRIBUTE = "data-compact-device";
const originalScreen = Object.getOwnPropertyDescriptor(window, "screen");

/** 터치가 되는 휴대폰 크기 화면을 흉내 낸다. */
const stubPhoneScreen = () => {
  Object.defineProperty(window, "ontouchstart", {
    configurable: true,
    value: null,
  });
  Object.defineProperty(window, "screen", {
    configurable: true,
    value: { width: 390, height: 844 },
  });
};

const runScript = () => {
  // 인라인으로 심는 스크립트를 그대로 돌려 본다.
  new Function(COMPACT_DEVICE_LAYOUT_SCRIPT)();
};

describe("기기 판별 속성", () => {
  afterEach(() => {
    document.documentElement.removeAttribute(ATTRIBUTE);
    Reflect.deleteProperty(window, "ontouchstart");
    Reflect.deleteProperty(window, "__zimdugoSyncCompactDevice");
    if (originalScreen) {
      Object.defineProperty(window, "screen", originalScreen);
    }
  });

  it("터치가 되는 작은 화면이면 속성을 붙인다", () => {
    stubPhoneScreen();
    runScript();

    expect(document.documentElement.getAttribute(ATTRIBUTE)).toBe("true");
  });

  it("하이드레이션 실패로 속성이 지워져도 다시 붙인다", () => {
    stubPhoneScreen();
    runScript();
    // React 가 html 을 다시 그리며 모르는 속성을 지운 상황
    document.documentElement.removeAttribute(ATTRIBUTE);

    syncCompactDeviceAttribute();

    expect(document.documentElement.getAttribute(ATTRIBUTE)).toBe("true");
  });

  it("스크립트가 돌지 않은 환경에서는 아무것도 붙이지 않는다", () => {
    stubPhoneScreen();

    syncCompactDeviceAttribute();

    expect(document.documentElement.hasAttribute(ATTRIBUTE)).toBe(false);
  });
});
