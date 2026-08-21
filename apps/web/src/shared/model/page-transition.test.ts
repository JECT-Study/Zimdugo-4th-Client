import { describe, expect, it } from "vitest";
import { isPathnameTransitionPending } from "./page-transition";

describe("isPathnameTransitionPending", () => {
  it.each([
    ["설정", "/", "/settings"],
    ["공지", "/settings", "/notices"],
    ["설정 복귀", "/notices", "/settings"],
    ["제보", "/", "/report"],
    ["하위 경로", "/settings", "/my/reports"],
  ])("%s pathname 전환을 표시한다", (_, resolvedPathname, currentPathname) => {
    expect(
      isPathnameTransitionPending({
        status: "pending",
        currentPathname,
        resolvedPathname,
      }),
    ).toBe(true);
  });

  it("locale prefix 차이는 앱 내부 pathname 전환으로 보지 않는다", () => {
    expect(
      isPathnameTransitionPending({
        status: "pending",
        currentPathname: "/en/settings",
        resolvedPathname: "/settings",
      }),
    ).toBe(false);
  });

  it.each(["query", "hash"])(
    "같은 pathname의 %s 전환은 표시하지 않는다",
    () => {
      expect(
        isPathnameTransitionPending({
          status: "pending",
          currentPathname: "/",
          resolvedPathname: "/",
        }),
      ).toBe(false);
    },
  );

  it.each(["완료", "실패 또는 취소"])(
    "%s 후 router가 idle이면 즉시 종료한다",
    () => {
      expect(
        isPathnameTransitionPending({
          status: "idle",
          currentPathname: "/settings",
          resolvedPathname: "/",
        }),
      ).toBe(false);
    },
  );

  it("초기 hydration에는 표시하지 않는다", () => {
    expect(
      isPathnameTransitionPending({
        status: "pending",
        currentPathname: "/",
      }),
    ).toBe(false);
  });
});
