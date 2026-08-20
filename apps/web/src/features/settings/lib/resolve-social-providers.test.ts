import { describe, expect, it } from "vitest";
import { resolveSocialProviders } from "./resolve-social-providers";

describe("resolveSocialProviders", () => {
  it("지원하는 provider를 원래 순서대로 반환한다", () => {
    expect(resolveSocialProviders(["google", "naver", "kakao"])).toEqual([
      "google",
      "naver",
      "kakao",
    ]);
  });

  it("대소문자를 정규화하고 미지원 값과 중복을 제거한다", () => {
    expect(
      resolveSocialProviders(["GOOGLE", "apple", "google", "NAVER"]),
    ).toEqual(["google", "naver"]);
  });

  it("provider가 없으면 빈 배열을 반환한다", () => {
    expect(resolveSocialProviders(undefined)).toEqual([]);
  });
});
