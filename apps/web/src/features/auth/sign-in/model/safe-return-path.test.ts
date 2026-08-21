import { describe, expect, it } from "vitest";
import { resolveSafeReturnPath } from "./safe-return-path";

describe("resolveSafeReturnPath", () => {
  it("내부 경로는 그대로 유지한다", () => {
    expect(resolveSafeReturnPath("/my/favorites?tab=1")).toBe(
      "/my/favorites?tab=1",
    );
  });

  it("경로가 없으면 홈으로 대체한다", () => {
    expect(resolveSafeReturnPath(undefined)).toBe("/");
    expect(resolveSafeReturnPath("")).toBe("/");
  });

  it("외부 URL은 홈으로 대체한다", () => {
    expect(resolveSafeReturnPath("//evil.com")).toBe("/");
    expect(resolveSafeReturnPath("https://evil.com")).toBe("/");
    expect(resolveSafeReturnPath("/redirect?next=javascript://evil")).toBe("/");
  });
});
