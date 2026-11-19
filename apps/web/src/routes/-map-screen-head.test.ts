import { describe, expect, it } from "vitest";
import { createLockerDetailTitle } from "./-map-screen-head";

describe("createLockerDetailTitle", () => {
  it("장소를 알면 장소 물품보관함을 제목 앞에 둔다", () => {
    expect(
      createLockerDetailTitle({
        name: "T-Locker",
        placeName: "강남역 2번 출구",
        locale: "ko",
      }),
    ).toBe("강남역 2번 출구 물품보관함 - T-Locker | 짐두고 (Zimdugo)");
  });

  it("보관함 이름이 장소 이름을 품고 있으면 이름만 쓴다", () => {
    expect(
      createLockerDetailTitle({
        name: "강남역 2번 출구 보관함",
        placeName: "강남역 2번 출구",
        locale: "ko",
      }),
    ).toBe("강남역 2번 출구 보관함 | 짐두고 (Zimdugo) 물품보관함");
  });

  it("장소를 모르면 이름만 쓴다", () => {
    expect(
      createLockerDetailTitle({
        name: "T-Locker",
        placeName: " ",
        locale: "en",
      }),
    ).toBe("T-Locker | Zimdugo Luggage Storage");
  });
});
