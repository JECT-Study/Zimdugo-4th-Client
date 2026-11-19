import { describe, expect, it } from "vitest";
import { createLockerOgImageUrl } from "./locker-og-image-url";

describe("createLockerOgImageUrl", () => {
  it("판 번호를 붙여 미리보기 서비스가 예전 캐시 대신 새 그림을 받아 가게 한다", () => {
    expect(createLockerOgImageUrl(1326)).toBe(
      "https://zimdugo.com/og/lockers/1326/map.png?v=2",
    );
  });
});
