import { setLanguageTag } from "@repo/i18n";
import { beforeEach, describe, expect, it } from "vitest";
import { resolveMyPageNickname } from "./resolve-my-page-nickname";

describe("resolveMyPageNickname", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  it("프로필 닉네임을 우선한다", () => {
    expect(
      resolveMyPageNickname({
        profileNickname: " 여정이 ",
        email: "traveler@example.com",
      }),
    ).toBe("여정이");
  });

  it("프로필 닉네임이 비어 있으면 이메일 앞부분을 사용한다", () => {
    expect(
      resolveMyPageNickname({
        profileNickname: " ",
        email: "traveler@example.com",
      }),
    ).toBe("traveler");
  });

  it("사용자 정보가 모두 비어 있어도 기본 닉네임을 반환한다", () => {
    expect(
      resolveMyPageNickname({
        profileNickname: undefined,
        email: null,
      }),
    ).toBe("사용자");
  });
});
