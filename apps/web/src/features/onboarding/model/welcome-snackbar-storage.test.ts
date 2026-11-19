import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hasSeenWelcomeSnackbar,
  markWelcomeSnackbarAsSeen,
  WELCOME_SNACKBAR_STORAGE_KEY,
} from "./welcome-snackbar-storage";

describe("첫 방문 안내 저장소", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("현재 버전을 확인하기 전에는 안내를 노출한다", () => {
    expect(hasSeenWelcomeSnackbar()).toBe(false);
  });

  it("현재 버전을 확인하면 다시 노출하지 않는다", () => {
    markWelcomeSnackbarAsSeen();

    expect(window.localStorage.getItem(WELCOME_SNACKBAR_STORAGE_KEY)).toBe(
      "seen",
    );
    expect(hasSeenWelcomeSnackbar()).toBe(true);
  });

  it("저장소를 읽을 수 없으면 안내를 노출한다", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("차단됨", "SecurityError");
    });

    expect(hasSeenWelcomeSnackbar()).toBe(false);
  });

  it("저장소에 쓸 수 없어도 예외를 던지지 않는다", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("차단됨", "SecurityError");
    });

    expect(() => markWelcomeSnackbarAsSeen()).not.toThrow();
  });
});
