import { afterEach, describe, expect, it } from "vitest";
import {
  clearHomeLocationRequestedInSession,
  hasRequestedHomeLocationInSession,
  markHomeLocationRequestedInSession,
} from "./home-location-request-session";

describe("홈 위치 요청 세션", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("첫 요청 전에는 false 를 준다", () => {
    expect(hasRequestedHomeLocationInSession()).toBe(false);
  });

  it("현재 탭 세션 동안 요청을 기억한다", () => {
    markHomeLocationRequestedInSession();

    expect(hasRequestedHomeLocationInSession()).toBe(true);
  });

  it("끝난 요청은 잊는다", () => {
    markHomeLocationRequestedInSession();

    clearHomeLocationRequestedInSession();

    expect(hasRequestedHomeLocationInSession()).toBe(false);
  });
});
